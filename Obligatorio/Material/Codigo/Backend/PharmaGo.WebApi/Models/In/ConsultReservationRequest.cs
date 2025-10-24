using PharmaGo.Domain.Entities;

namespace PharmaGo.WebApi.Models.In
{
    public class ConsultReservationRequest
    {
        public string Email { get; set; }
        public string Secret { get; set; }

        public Reservation ToEntity()
        {
            return new Reservation
            {
                Email = this.Email,
                Secret = this.Secret
            };
        }
    }
}