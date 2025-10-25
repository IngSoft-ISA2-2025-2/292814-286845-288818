using System;
using System.Collections.Generic;
using PharmaGo.Domain.Enums;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaGo.Domain.Entities
{
    public class Reservation
    {
        public Reservation()
        {
            if (string.IsNullOrEmpty(IdReferencia))
            {
                IdReferencia = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
            }
        }

        public int Id { get; set; }
        public string PharmacyName { get; set; }
        public Pharmacy Pharmacy { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pendiente;
        public ICollection<ReservationDrug> Drugs { get; set; }
        public string Email { get; set; }
        public string Secret { get; set; }
        public DateTime? FechaLimiteConfirmacion { get; set; }
        public string IdReferencia { get; set; }
        public DateTime? FechaExpiracion { get; set; }
        public DateTime? FechaCancelacion { get; set; }
        public DateTime? FechaRetiro { get; set; }
    }

    public class ReservationDrug
    {
        public int Id { get; set; }
        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; }
        public int DrugId { get; set; }
        public Drug Drug { get; set; }
        public int Quantity { get; set; }
    }
}
