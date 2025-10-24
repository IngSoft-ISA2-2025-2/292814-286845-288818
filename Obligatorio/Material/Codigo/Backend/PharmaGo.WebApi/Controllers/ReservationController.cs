using Microsoft.AspNetCore.Mvc;
using PharmaGo.IBusinessLogic;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;

namespace PharmaGo.WebApi.Controllers
{
    public class ReservationController : ControllerBase
    {
        private readonly IReservationManager _reservationManager;
        public ReservationController(IReservationManager reservationManager)
        {
            _reservationManager = reservationManager;
        }

        [HttpPost]
        public IActionResult CreateReserva(ReservationModel reservationModel)
        {
            var reserva = _reservationManager.CreateReservation(reservationModel.ToEntity());
            var response = new ReservationModelResponse
            {
                PharmacyName = reserva.PharmacyName,
                DrugsReserved = reserva.ReservationDrugs.Select(d => new ReservationDrugModelResponse
                {
                    DrugName = d.Drug.Name,
                    DrugQuantity = d.Quantity
                }).ToList()
            };
            return Ok(response);
        }
    }
}
