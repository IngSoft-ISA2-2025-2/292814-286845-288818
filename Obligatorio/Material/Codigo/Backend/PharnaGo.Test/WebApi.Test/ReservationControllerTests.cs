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
        public void Create_Reservation_Ok()
        {
            //Arrange
            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
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

        [TestMethod]
        public void Create_Reservation_UnAuthorizedUser()
        {
            // Arrange
            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
                .Throws(new UnauthorizedAccessException("User is not authorized to create a reservation."));

            // Act & Assert
            var ex = Assert.ThrowsException<UnauthorizedAccessException>(() =>
                _reservationController.CreateReserva(reservationModel)
            );
            Assert.AreEqual("User is not authorized to create a reservation.", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WithNonExistentReservation_ThrowsNotFoundException()
        {
            // Arrange
            string email = "sinreserva@example.com";
            string secret = "cualquiera";

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret))
                .Throws(new KeyNotFoundException("No existe una reserva asociada a ese correo"));

            // Act & Assert
            var ex = Assert.ThrowsException<KeyNotFoundException>(() =>
                _reservationController.CancelReservation(email, secret)
            );
            Assert.AreEqual("No existe una reserva asociada a ese correo", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WithInvalidSecret_ThrowsUnauthorizedException()
        {
            // Arrange
            string email = "cliente@example.com";
            string wrongSecret = "equivocado";

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, wrongSecret))
                .Throws(new UnauthorizedAccessException("Secret inválido para ese correo"));

            // Act & Assert
            var ex = Assert.ThrowsException<UnauthorizedAccessException>(() =>
                _reservationController.CancelReservation(email, wrongSecret)
            );
            Assert.AreEqual("Secret inválido para ese correo", ex.Message);
        }
    }
}
