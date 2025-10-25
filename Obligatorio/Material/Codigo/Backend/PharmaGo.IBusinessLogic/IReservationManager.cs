using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PharmaGo.Domain.Entities;

namespace PharmaGo.IBusinessLogic
{

    public interface IReservationManager
    {
        Reservation CreateReservation(Reservation reservation);
        List<Reservation> GetReservationsByUser(string email, string secret);
    }
}
