using System.Collections.Generic;

namespace PharmaGo.WebApi.Models.Out
{
    public class ReservationResponse
    {
        public string PharmacyName { get; set; }
        public string Status { get; set; }
        public List<ReservationDrugResponse> ReservedDrugs { get; set; }
    }

    public class ReservationDrugResponse
    {
        public string DrugName { get; set; }
        public int Quantity { get; set; }
    }
}