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
            if (string.IsNullOrEmpty(ReferenceId))
            {
                ReferenceId = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
            }
        }

        public int Id { get; set; }
        public string PharmacyName { get; set; }
        public Pharmacy Pharmacy { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public ICollection<ReservationDrug> Drugs { get; set; }
        public string Email { get; set; }
        public string Secret { get; set; }
        public DateTime? LimitConfirmationDate { get; set; }
        public string ReferenceId { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public DateTime? CancellationDate { get; set; }
        public DateTime? RetirementDate { get; set; }
        public string PublicKey { get; set; }
        public string PrivateKey { get; set; }
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
