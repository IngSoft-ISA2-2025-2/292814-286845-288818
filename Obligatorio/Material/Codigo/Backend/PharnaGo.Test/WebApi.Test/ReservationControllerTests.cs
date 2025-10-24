using Microsoft.AspNetCore.Mvc;
using Moq;
using PharmaGo.Domain.Entities;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;
using System.Collections.Generic;
using System.Linq;

namespace PharmaGo.Test.WebApi.Test
{
    [TestClass]
    public class ReservationControllerTests
    {
        private ReservationController _reservationController;
        private Mock<IReservationManager> _reservationManagerMock;
        private ConsultReservationRequest _consultReservationRequest;
        private List<Reservation> _reservations;
        private Pharmacy _pharmacy;
        private Drug _drug;

        [TestInitialize]
        public void SetUp()
        {
            _reservationManagerMock = new Mock<IReservationManager>(MockBehavior.Strict);
            _reservationController = new ReservationController(_reservationManagerMock.Object);

            _pharmacy = new Pharmacy
            {
                Id = 1,
                Name = "Farmashop",
                Address = "Av. Principal 123"
            };

            _drug = new Drug
            {
                Id = 1,
                Code = "ASP-001",
                Name = "Aspirina",
                Symptom = "Dolor de cabeza",
                Quantity = 100,
                Price = 50,
                Stock = 200,
                Prescription = false,
                Deleted = false,
                UnitMeasure = new UnitMeasure { Id = 1, Name = "mg", Deleted = false },
                Presentation = new Presentation { Id = 1, Name = "Tableta", Deleted = false },
                Pharmacy = _pharmacy
            };

            _consultReservationRequest = new ConsultReservationRequest()
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            _reservations = new List<Reservation>
            {
                new Reservation
                {
                    Id = 1,
                    PharmacyName = "Farmashop",
                    Pharmacy = _pharmacy,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 2
                        }
                    },
                    Status = "Pending"
                },
                new Reservation
                {
                    Id = 2,
                    PharmacyName = "Farmacia Central",
                    Pharmacy = _pharmacy,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 1
                        }
                    },
                    Status = "Confirmed"
                }
            };
        }

        [TestCleanup]
        public void Cleanup()
        {
            _reservationManagerMock.VerifyAll();
        }

        [TestMethod]
        public void GetReservationsByUser_Ok()
        {
            // Arrange
            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(
                    _consultReservationRequest.Email,
                    _consultReservationRequest.Secret))
                .Returns(_reservations);

            // Act
            var result = _reservationController.GetReservations(_consultReservationRequest);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(_reservations.Count, value.Count);

            for (int i = 0; i < _reservations.Count; i++)
            {
                Assert.AreEqual(_reservations[i].PharmacyName, value[i].PharmacyName);
                Assert.AreEqual(_reservations[i].Drugs.Count, value[i].ReservedDrugs.Count);
                Assert.AreEqual(_reservations[i].Status, value[i].Status);
                
                var reservationDrugs = _reservations[i].Drugs.ToList();

                for (int j = 0; j < reservationDrugs.Count; j++)
                {
                    Assert.AreEqual(reservationDrugs[j].Drug.Name, value[i].ReservedDrugs[j].DrugName);
                    Assert.AreEqual(reservationDrugs[j].Quantity, value[i].ReservedDrugs[j].Quantity);
                }
            }
        }
    }

    public class ConsultReservationRequest
    {
        public string Email { get; set; }
        public string Secret { get; set; }
    }

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

    public class Reservation
    {
        public int Id { get; set; }
        public string PharmacyName { get; set; }
        public Pharmacy Pharmacy { get; set; }
        public string Status { get; set; }
        public ICollection<ReservationDrug> Drugs { get; set; }
    }

    public class ReservationDrug
    {
        public int DrugId { get; set; }
        public Drug Drug { get; set; }
        public int Quantity { get; set; }
    }

    public interface IReservationManager
    {
        List<Reservation> GetReservationsByUser(string email, string secret);
    }

    public class ReservationController : ControllerBase
    {
        private readonly IReservationManager _reservationManager;

        public ReservationController(IReservationManager reservationManager)
        {
            _reservationManager = reservationManager;
        }

        [HttpPost]
        public IActionResult GetReservations(ConsultReservationRequest consultReservationRequest)
        {
            var reservations = _reservationManager.GetReservationsByUser(
                consultReservationRequest.Email, 
                consultReservationRequest.Secret);
            
            var response = reservations.Select(r => new ReservationResponse
            {
                PharmacyName = r.PharmacyName,
                Status = r.Status,
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