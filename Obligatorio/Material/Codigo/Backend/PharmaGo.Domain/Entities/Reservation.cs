using System.Collections.Generic;
using PharmaGo.Domain.Enums;

namespace PharmaGo.Domain.Entities
{
    public class Reservation
    {
        public int Id { get; set; }
        public string PharmacyName { get; set; }
        public Pharmacy Pharmacy { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pendiente;
        public ICollection<ReservationDrug> Drugs { get; set; }
    }

    public class ReservationDrug
    {
        public int DrugId { get; set; }
        public Drug Drug { get; set; }
        public int Quantity { get; set; }
    }
}