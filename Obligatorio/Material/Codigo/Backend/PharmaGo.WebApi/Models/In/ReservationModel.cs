using PharmaGo.Domain.Entities;

namespace PharmaGo.WebApi.Models.In
{
    public class ReservationModel
    {
        public string PharmacyName { get; set; }
        public List<ReservationDrugModel> DrugsReserved { get; set; }


        public Reservation ToEntity()
        {
            return new Reservation()
            {
                Pharmacy = new Pharmacy() { Name = this.PharmacyName },
                ReservationDrugs = this.DrugsReserved.Select(d => new ReservationDrug
                {
                Drug = new Drug() { Name = d.DrugName },
                Quantity = d.DrugQuantity
            }).ToList()
            };
        }

    }

    public class ReservationDrugModel
    {
        public string DrugName { get; set; }
        public int DrugQuantity { get; set; }
    }
}
