using System.Collections.Generic;
using System.Linq;
using PharmaGo.Domain.Entities;

namespace PharmaGo.WebApi.Models.Out
{
    public class ReservationResponse
    {
        public string PharmacyName { get; set; }
        public string Status { get; set; }
        public List<ReservationDrugResponse> ReservedDrugs { get; set; }
        public DateTime? FechaLimiteConfirmacion { get; set; }
        public string IdReferencia { get; set; }

        public static ReservationResponse FromEntity(Reservation reservation)
        {
            return new ReservationResponse
            {
                PharmacyName = reservation.PharmacyName,
                Status = reservation.Status.ToString(),
                ReservedDrugs = reservation.Drugs?.Select(ReservationDrugResponse.FromEntity).ToList() ?? new List<ReservationDrugResponse>(),
                FechaLimiteConfirmacion = reservation.FechaLimiteConfirmacion,
                IdReferencia = reservation.IdReferencia,
            };
        }
    }

    public class ReservationDrugResponse
    {
        public string DrugName { get; set; }
        public int Quantity { get; set; }

        public static ReservationDrugResponse FromEntity(ReservationDrug reservationDrug)
        {
            return new ReservationDrugResponse
            {
                DrugName = reservationDrug.Drug?.Name,
                Quantity = reservationDrug.Quantity
            };
        }
    }
}