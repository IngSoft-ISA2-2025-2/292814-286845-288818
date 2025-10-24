using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PharmaGo.Domain.Entities;
using PharmaGo.Exceptions;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;

namespace PharmaGo.BusinessLogic
{
    public class ReservationManager : IReservationManager
    {
        private IRepository<Reservation> reservationRepository;
        private IRepository<Pharmacy> pharmacyRepository;

        public ReservationManager(IRepository<Reservation> reservationRepository,
            IRepository<Pharmacy> pharmacyRepository)
        {
            this.reservationRepository = reservationRepository;
            this.pharmacyRepository = pharmacyRepository;
        }

        public Reservation CreateReservation(Reservation reservation)
        {
            if (reservationRepository.Exists(
                r => r.Email == reservation.Email
                && r.Secret != reservation.Secret))
                throw new UnauthorizedAccessException("User is not authorized to create a reservation.");

            if(!pharmacyRepository.Exists(p => p.Name == reservation.PharmacyName))
                throw new ResourceNotFoundException("The pharmacy for the reservation does not exist.");
            reservationRepository.InsertOne(reservation);
            reservationRepository.Save();
            return reservation;
        }
    }
}
