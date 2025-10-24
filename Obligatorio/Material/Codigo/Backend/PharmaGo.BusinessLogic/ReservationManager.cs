using PharmaGo.Domain.Entities;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;
using System.Collections.Generic;
using System.Linq;

namespace PharmaGo.BusinessLogic
{
    public class ReservationManager : IReservationManager
    {
        private readonly IRepository<Reservation> _reservationRepository;

        public ReservationManager(IRepository<Reservation> reservationRepository)
        {
            _reservationRepository = reservationRepository;
        }

        public List<Reservation> GetReservationsByUser(string email, string secret)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(secret))
            {
                throw new ArgumentException("Debe ingresar un email y secret para consultar reservas.");
            }
            var reservations = _reservationRepository.GetAllByExpression(r => r.Email == email && r.Secret == secret);
            return reservations.ToList();
        }
    }
}