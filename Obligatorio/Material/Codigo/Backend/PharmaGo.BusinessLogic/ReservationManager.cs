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
            ValidarEmailYSecret(email, secret);

            var reservations = _reservationRepository.GetAllByExpression(r => r.Email == email);

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