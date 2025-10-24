using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PharmaGo.Domain.Entities;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;

namespace PharmaGo.BusinessLogic
{
    public class ReservationManager : IReservationManager
    {
        private IRepository<Reservation> reservationRepository;

        public ReservationManager(IRepository<Reservation> reservationRepository)
        {
            this.reservationRepository = reservationRepository;
        }

        public Reservation CreateReservation(Reservation reservation)
        {
            if (reservationRepository.Exists(
                r => r.Email == reservation.Email
                && r.Secret != reservation.Secret))
                throw new UnauthorizedAccessException("User is not authorized to create a reservation.");

            reservationRepository.InsertOne(reservation);
            reservationRepository.Save();
            return reservation;
        }
    }
}
