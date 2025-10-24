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
        public ICollection<ReservationDrug> ReservationDrugs { get; set; }
    }

    public class ReservationDrug
    {
        public int DrugId { get; set; }
        public Drug Drug { get; set; }
        public int Quantity { get; set; }
    }
}
