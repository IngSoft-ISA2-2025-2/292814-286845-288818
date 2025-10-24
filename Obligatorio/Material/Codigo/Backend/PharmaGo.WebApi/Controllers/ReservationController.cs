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

        [HttpGet]
        public IActionResult GetReservations([FromQuery] ConsultReservationRequest consultReservationRequest)
        {
            if (string.IsNullOrWhiteSpace(consultReservationRequest.Email) || string.IsNullOrWhiteSpace(consultReservationRequest.Secret))
            {
                return BadRequest("Debe ingresar un email y secret para consultar reservas.");
            }
            var reservations = _reservationManager.GetReservationsByUser(
                consultReservationRequest.Email, 
                consultReservationRequest.Secret);
            
            var response = reservations.Select(r => new ReservationResponse
            {
                PharmacyName = r.PharmacyName,
                Status = r.Status.ToString(),
                ReservedDrugs = r.Drugs.Select(d => new ReservationDrugResponse
                {
                    DrugName = d.Drug.Name,
                    Quantity = d.Quantity
                }).ToList()
            }).ToList();

            return Ok(response);
        }
    }
}