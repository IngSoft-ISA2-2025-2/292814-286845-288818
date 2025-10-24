using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using PharmaGo.BusinessLogic;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using PharmaGo.IDataAccess;
using PharmaGo.IBusinessLogic;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace PharmaGo.Test.BusinessLogic.Test
{
    [TestClass]
    public class ReservationManagerTests
    {
        private Mock<IRepository<Reservation>> _reservationRepository;
        private ReservationManager _reservationManager;
        private List<Reservation> _reservations;
        private Pharmacy _pharmacy;
        private Drug _drug;
        private const Reservation nullReservation = null;

        [TestInitialize]
        public void InitTest()
        {
            _reservationRepository = new Mock<IRepository<Reservation>>();
            _reservationManager = new ReservationManager(_reservationRepository.Object);

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
                    Email = "usuario@test.com",
                    Secret = "miSecret123",
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 2
                        }
                    },
                    Status = ReservationStatus.Pendiente
                },
                new Reservation
                {
                    Id = 2,
                    PharmacyName = "Farmacia Central",
                    Pharmacy = _pharmacy,
                    Email = "usuario@test.com",
                    Secret = "miSecret123",
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 1
                        }
                    },
                    Status = ReservationStatus.Confirmada
                }
            };
        }

        [TestCleanup]
        public void Cleanup()
        {
            _reservationRepository.VerifyAll();
        }

        [TestMethod]
        public void GetReservationsByUser_Ok()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";

            _reservationRepository
                .Setup(r => r.GetAllByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(_reservations);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            _reservationRepository.VerifyAll();
            Assert.IsNotNull(result);
            Assert.AreEqual(_reservations.Count, result.Count);
            Assert.AreEqual(_reservations[0].Id, result[0].Id);
            Assert.AreEqual(_reservations[0].PharmacyName, result[0].PharmacyName);
            Assert.AreEqual(_reservations[0].Status, result[0].Status);
            Assert.AreEqual(_reservations[0].Email, result[0].Email);
            Assert.AreEqual(_reservations[1].Id, result[1].Id);
            Assert.AreEqual(_reservations[1].PharmacyName, result[1].PharmacyName);
            Assert.AreEqual(_reservations[1].Status, result[1].Status);
            Assert.AreEqual(_reservations[1].Email, result[1].Email);
        }
    }
}