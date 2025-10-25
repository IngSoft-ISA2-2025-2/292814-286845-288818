namespace PharmaGo.WebApi.Models.Out
{
    public class ReservationModelResponse
    {
        public string PharmacyName { get; set; }
        public List<ReservationDrugModelResponse> DrugsReserved { get; set; }
        public string Status { get; set; }

        public static ReservationModelResponse FromEntity(PharmaGo.Domain.Entities.Reservation reserva)
        {
            return new ReservationModelResponse
            {
                PharmacyName = reserva.PharmacyName,
                DrugsReserved = reserva.Drugs.Select(d => new ReservationDrugModelResponse
                {
                    DrugName = d.Drug.Name,
                    DrugQuantity = d.Quantity
                }).ToList(),
                Status = reserva.Status.ToString()
            };
        }
    }

    public class ReservationDrugModelResponse
    {
        public string DrugName { get; set; }
        public int DrugQuantity { get; set; }
    }
}
