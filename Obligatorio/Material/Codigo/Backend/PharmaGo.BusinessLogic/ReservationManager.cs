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


            foreach (var reservationDrug in reservation.Drugs)
            {
                if (!drugRepository.Exists(d => d.Name == reservationDrug.Drug.Name
                    && d.Pharmacy.Name == reservation.PharmacyName))
                {
                    throw new ResourceNotFoundException(
                        $"The drug {reservationDrug.Drug.Name} for the reservation does not exist in the pharmacy {reservation.PharmacyName}.");
                }

                var drug = drugRepository.GetOneByExpression(d => d.Name == reservationDrug.Drug.Name
                    && d.Pharmacy.Name == reservation.PharmacyName);

                if(drug.Stock < reservationDrug.Quantity)
                {
                    throw new InvalidResourceException(
                        $"The drug {reservationDrug.Drug.Name} for the reservation has insufficient stock.");
                }
                drug.Stock -= reservationDrug.Quantity;
                drugRepository.UpdateOne(drug);
            }
            var (publicKey, privateKey) = KeyPairGenerator.GenerateKeyPair();
            reservation.PublicKey = publicKey;
            reservation.PrivateKey = privateKey;

            reservation.Status = ReservationStatus.Pendiente;

            reservationRepository.InsertOne(reservation);
            reservationRepository.Save();
            return reservation;
        }

        private static class KeyPairGenerator
        {
            public static (string publicKey, string privateKey) GenerateKeyPair()
            {
                using (var rsa = new System.Security.Cryptography.RSACryptoServiceProvider(2048))
                {
                    string publicKey = Convert.ToBase64String(rsa.ExportRSAPublicKey());
                    string privateKey = Convert.ToBase64String(rsa.ExportRSAPrivateKey());
                    return (publicKey, privateKey);
                }
            }
        }

        public Reservation ValidateReservation(string publicKey)
        {
            if(!reservationRepository.Exists(r=> r.PublicKey == publicKey))
                throw new ResourceNotFoundException("No reservation found with the provided public key.");

            var reservation = reservationRepository.GetOneByExpression(r => r.PublicKey == publicKey);

            if(reservation.FechaExpiracion.HasValue && reservation.FechaExpiracion.Value < DateTime.Now)
                throw new InvalidResourceException("The reservation has expired and cannot be validated.");

            return reservation;
        }

        public List<Reservation> GetReservationsByUser(string email, string secret)
        {
            ValidarEmailYSecret(email, secret);

            var reservations = reservationRepository.GetAllByExpression(r => r.Email == email);

            ValidarSecretParaEmail(reservations, secret);

            return FiltrarPorSecret(reservations, secret);
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
    }
}
