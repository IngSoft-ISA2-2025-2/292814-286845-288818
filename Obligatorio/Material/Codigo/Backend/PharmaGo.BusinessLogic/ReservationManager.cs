using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;
using PharmaGo.Domain.SearchCriterias;
using PharmaGo.Exceptions;
using System.Collections.Generic;
using System.Linq;

namespace PharmaGo.BusinessLogic
{
    public class ReservationManager : IReservationManager
    {
        private IRepository<Reservation> reservationRepository;
        private IRepository<Pharmacy> pharmacyRepository;
        private IRepository<Drug> drugRepository;

        public ReservationManager(IRepository<Reservation> reservationRepository,
            IRepository<Pharmacy> pharmacyRepository,
            IRepository<Drug> drugRepository)
        {
            this.reservationRepository = reservationRepository;
            this.pharmacyRepository = pharmacyRepository;
            this.drugRepository = drugRepository;
        }

        public Reservation CreateReservation(Reservation reservation)
        {
            if (reservationRepository.Exists(
                r => r.Email == reservation.Email
                && r.Secret != reservation.Secret))
                throw new UnauthorizedAccessException("User is not authorized to create a reservation.");

            if(!pharmacyRepository.Exists(p => p.Name == reservation.PharmacyName))
                throw new ResourceNotFoundException("The pharmacy for the reservation does not exist.");

            var pharmacy = pharmacyRepository.GetOneByExpression(p => p.Name == reservation.PharmacyName);
            reservation.Pharmacy = pharmacy;

            foreach (var reservationDrug in reservation.Drugs)
            {
                if (!drugRepository.Exists(d => d.Name == reservationDrug.Drug.Name
                    && d.Pharmacy != null && d.Pharmacy.Name == reservation.PharmacyName))
                {
                    throw new ResourceNotFoundException(
                        $"The drug {reservationDrug.Drug.Name} for the reservation does not exist in the pharmacy {reservation.PharmacyName}.");
                }

                var drug = drugRepository.GetOneByExpression(d => d.Name == reservationDrug.Drug.Name
                    && d.Pharmacy != null && d.Pharmacy.Name == reservation.PharmacyName);

                if(drug.Stock < reservationDrug.Quantity)
                {
                    throw new InvalidResourceException(
                        $"The drug {reservationDrug.Drug.Name} for the reservation has insufficient stock.");
                }
                drug.Stock -= reservationDrug.Quantity;
                reservationDrug.Drug = drug;
                reservationDrug.DrugId = drug.Id;
                drugRepository.UpdateOne(drug);
            }
            
            var (publicKey, privateKey) = KeyPairGenerator.GenerateKeyPair();
            reservation.PublicKey = publicKey;
            reservation.PrivateKey = privateKey;

            reservation.Status = ReservationStatus.Pending;
            
            // Asignar fecha de creación
            reservation.CreatedAt = DateTime.Now;
            
            // Asignar fecha límite de confirmación (24 horas desde la creación)
            reservation.LimitConfirmationDate = DateTime.Now.AddHours(24);

            reservationRepository.InsertOne(reservation);
            reservationRepository.Save();
            return reservation;
        }

        private static class KeyPairGenerator
        {
            public static (string publicKey, string privateKey) GenerateKeyPair()
            {
                // Usar Guid para generar un identificador único
                string uniqueId = Guid.NewGuid().ToString("N");
                string publicKey = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(uniqueId));
                string privateKey = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(Guid.NewGuid().ToString("N")));
                return (publicKey, privateKey);
            }
        }

        public Reservation ValidateReservation(string publicKey)
        {
            if(!reservationRepository.Exists(r=> r.PublicKey == publicKey))
                throw new ResourceNotFoundException("No reservation found with the provided public key.");

            var reservation = reservationRepository.GetOneByExpression(r => r.PublicKey == publicKey);

            if(reservation.ExpirationDate.HasValue && reservation.ExpirationDate.Value < DateTime.Now)
                throw new InvalidResourceException("The reservation has expired and cannot be validated.");

            if(reservation.Status != ReservationStatus.Confirmed)
                throw new InvalidResourceException("The reservation is not confirmed.");

            reservation.Status = ReservationStatus.Withdrawal;
            reservation.RetirementDate = DateTime.Now;
            
            reservationRepository.UpdateOne(reservation);
            reservationRepository.Save();
            
            return reservation;
        }

        public List<Reservation> GetReservationsByUser(string email, string secret)
        {
            ValidarEmailYSecret(email, secret);

            var reservations = reservationRepository.GetAllByExpression(r => r.Email == email);

            ValidarSecretParaEmail(reservations, secret);

            var result = FiltrarPorSecret(reservations, secret);

            foreach (var reservation in result)
            {
                if (reservation.Status == ReservationStatus.Pending)
                {
                    reservation.ReferenceId = null;
                }
            }

            return result;
        }

        private void ValidarEmailYSecret(string email, string secret)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(secret))
                throw new ArgumentException("Debe ingresar un email y secret para consultar reservas.");
        }

        private void ValidarSecretParaEmail(IEnumerable<Reservation> reservations, string secret)
        {
            if (reservations.Any() && !reservations.Any(r => r.Secret == secret))
                throw new ArgumentException("El secret no coincide con el registrado para este email");
        }

        private List<Reservation> FiltrarPorSecret(IEnumerable<Reservation> reservations, string secret)
        {
            return reservations.Where(r => r.Secret == secret).ToList();
        }

        public Reservation CancelReservation(string email, string secret)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Se requiere un correo válido");

            if (!reservationRepository.Exists(r => r.Email == email && r.Secret == secret && r.Status == ReservationStatus.Canceled))
                throw new UnauthorizedAccessException("No se encontró una reserva para cancelar");

            var reservation = reservationRepository.GetOneByExpression(
                r => r.Email == email && r.Secret == secret && r.Status != ReservationStatus.Canceled);

            if (reservation == null)
                throw new KeyNotFoundException("No existe una reserva asociada a ese correo");

            if (reservation.Status == ReservationStatus.Expired)
                throw new InvalidOperationException("No se puede cancelar una reserva expirada");

            // Idempotencia: Si ya está cancelada, retornar sin actualizar
            if (reservation.Status == ReservationStatus.Canceled)
                return reservation;

            reservation.Status = ReservationStatus.Canceled;
            reservation.CancellationDate = DateTime.Now;
            foreach (var drug in reservation.Drugs)
            {
                var drugEntity = drugRepository.GetOneByExpression(d => d.Id == drug.DrugId);
                drugEntity.Stock += drug.Quantity;
                drugRepository.UpdateOne(drugEntity);
            }
            reservationRepository.UpdateOne(reservation);
            reservationRepository.Save();

            return reservation;
        }

        public Reservation ConfirmReservation(string referenceId)
        {
            var reservation = reservationRepository.GetOneByExpression(r => r.ReferenceId == referenceId);

            if (reservation == null)
                throw new KeyNotFoundException("No se encontró la reserva");

            if (reservation.Status == ReservationStatus.Canceled)
                throw new InvalidOperationException("No se puede confirmar una reserva cancelada");

            if (reservation.Status == ReservationStatus.Expired)
                throw new InvalidOperationException("No se puede confirmar una reserva expirada");

            // Si ya está confirmada, retornar sin modificar (idempotente)
            if (reservation.Status == ReservationStatus.Confirmed)
                return reservation;

            // Confirmar reserva pendiente
            reservation.Status = ReservationStatus.Confirmed;
            
            // Asignar fecha de expiración (48 horas desde la confirmación)
            reservation.ExpirationDate = DateTime.Now.AddHours(48);

            reservationRepository.UpdateOne(reservation);
            reservationRepository.Save();

            return reservation;
        }
    }
}
