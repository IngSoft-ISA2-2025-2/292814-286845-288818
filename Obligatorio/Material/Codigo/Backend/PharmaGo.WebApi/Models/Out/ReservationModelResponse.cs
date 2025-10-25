namespace PharmaGo.WebApi.Models.Out
{
    public class ReservationModelResponse
    {
        public string PharmacyName { get; set; }
        public List<ReservationDrugModelResponse> DrugsReserved { get; set; }
        public string Status { get; set; }
    }

    public class ReservationDrugModelResponse
    {
        public string DrugName { get; set; }
        public int DrugQuantity { get; set; }
    }
}
