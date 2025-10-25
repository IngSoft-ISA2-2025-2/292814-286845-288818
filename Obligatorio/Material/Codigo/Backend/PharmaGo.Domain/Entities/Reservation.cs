using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaGo.Domain.Entities
{
    public class Reservation
    {
        public int Id { get; set; }
        public string PharmacyName { get; set; }
        public Pharmacy Pharmacy { get; set; }
        public string Email { get; set; }
        public string Secret { get; set; }
        public ICollection<ReservationDrug> ReservationDrugs { get; set; }
        public string Status { get; set; }
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
