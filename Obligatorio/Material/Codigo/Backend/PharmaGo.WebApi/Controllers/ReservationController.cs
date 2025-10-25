using Microsoft.AspNetCore.Mvc;
using PharmaGo.IBusinessLogic;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using System.Linq;

namespace PharmaGo.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
                DrugsReserved = reserva.Drugs.Select(d => new ReservationDrugModelResponse
                {
                    DrugName = d.Drug.Name,
                    DrugQuantity = d.Quantity
                }).ToList(),
                Status = reserva.Status.ToString()
            };
            return Ok(response);
        }

        [HttpGet]
        public IActionResult GetReservations([FromQuery] ConsultReservationRequest consultReservationRequest)
        {
            var reservations = _reservationManager.GetReservationsByUser(
                consultReservationRequest.Email,
                consultReservationRequest.Secret);

            var response = reservations.Select(ReservationResponse.FromEntity).ToList();

            return Ok(response);
        }
    }
}
