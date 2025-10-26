using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using PharmaGo.Domain.Entities;

namespace PharmaGo.IBusinessLogic
{

    public interface IReservationManager
    {
        Reservation CreateReservation(Reservation reservation);
        Reservation ValidateReservation(string publicKey);
        List<Reservation> GetReservationsByUser(string email, string secret);
        Reservation CancelReservation(string email, string secret);
    }
}
