using Microsoft.AspNetCore.Mvc;
using Moq;
using PharmaGo.Domain.Entities;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;
using System.Collections.Generic;

namespace PharmaGo.Test.WebApi.Test
{
    [TestClass]
    public class ReservationControllerTests
    {
        private ReservationController _reservationController;
        private Mock<IReservationManager> _reservationManagerMock;
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
            var consultReservationRequest = new ConsultReservationRequest 
            { 
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };
            
            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(consultReservationRequest.Email, consultReservationRequest.Secret))
                .Returns(_reservations);

            // Act
            var result = _reservationController.GetReservations(consultReservationRequest);

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
                
                for (int j = 0; j < _reservations[i].Drugs.Count; j++)
                {
                    Assert.AreEqual(_reservations[i].Drugs[j].Drug.Name, value[i].ReservedDrugs[j].DrugName);
                    Assert.AreEqual(_reservations[i].Drugs[j].Quantity, value[i].ReservedDrugs[j].Quantity);
                }
            }
        }
    }
}