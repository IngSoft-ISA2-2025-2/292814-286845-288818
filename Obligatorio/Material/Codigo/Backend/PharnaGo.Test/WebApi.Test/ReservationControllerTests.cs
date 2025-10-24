using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Moq;
using PharmaGo.Domain.Entities;
using PharmaGo.IBusinessLogic;
using PharmaGo.WebApi.Controllers;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;

namespace PharmaGo.Test.WebApi.Test
{
    [TestClass]
    public class ReservaControllerTests
    {
        private ReservationController _reservationController;
        private Mock<IReservationManager> _reservationManagerMock;
        private ReservationModel reservationModel;
        private Reservation reservation;
        private Pharmacy pharmacyModel;
        private Drug drugModel;

        [TestInitialize]
        public void SetUp()
        {
            _reservationManagerMock = new Mock<IReservationManager>(MockBehavior.Strict);
            _reservationController = new ReservationController(_reservationManagerMock.Object);

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

            reservationModel = new ReservationModel()
            {
                DrugsReserved = new List<ReservationDrugModel>
                {
                    new ReservationDrugModel
                    {
                        DrugName = "Aspirina",
                        DrugQuantity = 1
                    }
                },
                PharmacyName = "Farmashop"
            };

            reservation = new Reservation()
            {
                Id = 1,
                PharmacyName = "Farmashop",
                Pharmacy = pharmacyModel,
                ReservationDrugs = new List<ReservationDrug>
                {
                    new ReservationDrug
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
            _reservationManagerMock.VerifyAll();
        }

        [TestMethod]
        public void Create_Reserva_Ok()
        {
            //Arrange
            _reservationManagerMock
                .Setup(service => service.CreateReserva(It.IsAny<Reservation>()))
                .Returns(reservation);

            //Act
            var result = _reservationController.CreateReserva(
                    reservationModel); 

            //Assert
            var objectResult = result as OkObjectResult;
            var statusCode = objectResult.StatusCode;
            var value = objectResult.Value as ReservationModelResponse;

            //Assert
            Assert.AreEqual(200, statusCode);
            Assert.AreEqual(reservationModel.PharmacyName, value.PharmacyName);
            Assert.AreEqual(reservationModel.DrugsReserved.Count, value.DrugsReserved.Count);
            for (int i = 0; i < reservationModel.DrugsReserved.Count; i++)
            {
                Assert.AreEqual(reservationModel.DrugsReserved[i].DrugName, value.DrugsReserved[i].DrugName);
                Assert.AreEqual(reservationModel.DrugsReserved[i].DrugQuantity, value.DrugsReserved[i].DrugQuantity);
            }
        }
    }
}
