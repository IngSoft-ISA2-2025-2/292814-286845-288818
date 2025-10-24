using Microsoft.AspNetCore.Mvc;
using Moq;
using PharmaGo.Domain.Entities;

namespace PharmaGo.Test.WebApi.Test
{
    [TestClass]
    public class ReservaControllerTests
    {
        private ReservaController _reservaController;
        private Mock<IReservaManager> _reservaManagerMock;
        private ReservaModel reservaModel;
        private Reserva reserva;
        private Pharmacy pharmacyModel;
        private Drug drugModel;

        [TestInitialize]
        public void SetUp()
        {
            _reservaManagerMock = new Mock<IReservaManager>(MockBehavior.Strict);
            _reservaController = new ReservaController(_reservaManagerMock.Object);

            pharmacyModel = new Pharmacy
            {
                Id = 1,
                Name = "Farmashop",
                Address = "Av. Principal 123"
            };

            drugModel = new Drug
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
                Pharmacy = pharmacyModel
            };

            reservaModel = new ReservaModel()
            {
                DrugsReserved = new List<ReservaDrugModel>
                {
                    new ReservaDrugModel
                    {
                        DrugName = "Aspirina",
                        DrugQuantity = 1
                    }
                },
                PharmacyName = "Farmashop"
            };

            reserva = new Reserva()
            {
                Id = 1,
                PharmacyName = "Farmashop",
                Pharmacy = pharmacyModel,
                Drugs = new List<ReservaDrug>
                {
                    new ReservaDrug
                    {
                        DrugId = 1,
                        Drug = drugModel,
                        Quantity = 1
                    }
                }
            };
        }

        [TestCleanup]
        public void Cleanup()
        {
            _reservaManagerMock.VerifyAll();
        }

        [TestMethod]
        public void Create_Reserva_Ok()
        {
            //Arrange
            _reservaManagerMock
                .Setup(service => service.CreateReserva(
                    reservaModel.DrugsReserved,
                    reservaModel.PharmacyName))
                .Returns(reserva);

            //Act
            var result = _reservaController.CreateReserva(
                    reservaModel); 

            //Assert
            var objectResult = result as OkObjectResult;
            var statusCode = objectResult.StatusCode;
            var value = objectResult.Value as ReservaModelResponse;

            //Assert
            Assert.AreEqual(200, statusCode);
            Assert.AreEqual(reservaModel.PharmacyName, value.PharmacyName);
            Assert.AreEqual(reservaModel.DrugsReserved.Count, value.DrugsReserved.Count);
            for (int i = 0; i < reservaModel.DrugsReserved.Count; i++)
            {
                Assert.AreEqual(reservaModel.DrugsReserved[i].DrugName, value.DrugsReserved[i].DrugName);
                Assert.AreEqual(reservaModel.DrugsReserved[i].DrugQuantity, value.DrugsReserved[i].DrugQuantity);
            }
        }

        public class ReservaModel
        {
            public string PharmacyName { get; set; }
            public List<ReservaDrugModel> DrugsReserved { get; set; }
        }
        public class ReservaDrugModel
        {
            public string DrugName { get; set; }
            public int DrugQuantity { get; set; }
        }

        public class Reserva
        {
            public int Id { get; set; }
            public string PharmacyName { get; set; }
            public Pharmacy Pharmacy { get; set; }
            public ICollection<ReservaDrug> Drugs { get; set; }
        }

        public class ReservaDrug
        {
            public int DrugId { get; set; }
            public Drug Drug { get; set; }
            public int Quantity { get; set; }
        }

        public class ReservaModelResponse
        {
            public string PharmacyName { get; set; }
            public List<ReservaDrugModelResponse> DrugsReserved { get; set; }
        }

        public class ReservaDrugModelResponse
        {
            public string DrugName { get; set; }
            public int DrugQuantity { get; set; }
        }

        public interface IReservaManager
        {
            Reserva CreateReserva(List<ReservaDrugModel> drugsReserved, string pharmacyName);
        }

        public class ReservaController : ControllerBase
        {
            private readonly IReservaManager _reservaManager;
            public ReservaController(IReservaManager reservaManager)
            {
                _reservaManager = reservaManager;
            }

            [HttpPost]
            public IActionResult CreateReserva(ReservaModel reservaModel)
            {
                var reserva = _reservaManager.CreateReserva(reservaModel.DrugsReserved, reservaModel.PharmacyName);
                var response = new ReservaModelResponse
                {
                    PharmacyName = reserva.PharmacyName,
                    DrugsReserved = reserva.Drugs.Select(d => new ReservaDrugModelResponse
                    {
                        DrugName = d.Drug.Name,
                        DrugQuantity = d.Quantity
                    }).ToList()
                };
                return Ok(response);
            }
        }
    }
}
