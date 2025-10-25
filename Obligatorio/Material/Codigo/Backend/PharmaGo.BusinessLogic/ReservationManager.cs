using PharmaGo.Domain.Entities;
using PharmaGo.Domain.SearchCriterias;
using PharmaGo.Exceptions;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;

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


            foreach (var reservationDrug in reservation.ReservationDrugs)
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

            reservation.Status = "Pending";

            reservationRepository.InsertOne(reservation);
            reservationRepository.Save();
            return reservation;
        }

        public Reservation CancelReservation(string email, string secret)
        {
            if (reservationRepository.Exists(r => r.Email == email && r.Secret != secret))
                throw new UnauthorizedAccessException("Secret inválido para ese correo");

            var reservation = reservationRepository.GetOneByExpression(
                r => r.Email == email && r.Secret == secret);

            if (reservation == null)
                throw new KeyNotFoundException("No existe una reserva asociada a ese correo");

            reservation.Status = "Cancelled";
            reservationRepository.UpdateOne(reservation);
            reservationRepository.Save();

            return reservation;
        }
    }
}
