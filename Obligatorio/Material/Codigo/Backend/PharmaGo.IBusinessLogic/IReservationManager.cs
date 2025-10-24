using PharmaGo.Domain.Entities;
using System.Collections.Generic;

namespace PharmaGo.IBusinessLogic
{
    public interface IReservationManager
    {
        List<Reservation> GetReservationsByUser(string email, string secret);
    }
}