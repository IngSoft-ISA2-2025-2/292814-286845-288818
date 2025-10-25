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
            var reservations = new List<Reservation>
            {
                new Reservation
                {
                    Id = 1,
                    PharmacyName = "Farmashop",
                    Email = email,
                    Secret = secret,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = new Drug { Name = "Aspirina" },
                            Quantity = 2
                        }
                    },
                    Status = ReservationStatus.Pendiente
                },
                new Reservation
                {
                    Id = 2,
                    PharmacyName = "Farmacia Central",
                    Email = email,
                    Secret = secret,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 2,
                            Drug = new Drug { Name = "Paracetamol" },
                            Quantity = 1
                        }
                    },
                    Status = ReservationStatus.Confirmada
                },
                new Reservation
                {
                    Id = 3,
                    PharmacyName = "Farmacia Sur",
                    Email = email,
                    Secret = secret,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 3,
                            Drug = new Drug { Name = "Ibuprofeno" },
                            Quantity = 3
                        }
                    },
                    Status = ReservationStatus.Expirada
                },
                new Reservation
                {
                    Id = 4,
                    PharmacyName = "Farmacia Norte",
                    Email = email,
                    Secret = secret,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 4,
                            Drug = new Drug { Name = "Amoxicilina" },
                            Quantity = 1
                        }
                    },
                    Status = ReservationStatus.Cancelada
                },
                new Reservation
                {
                    Id = 5,
                    PharmacyName = "Farmacia Este",
                    Email = email,
                    Secret = secret,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 5,
                            Drug = new Drug { Name = "Diclofenac" },
                            Quantity = 2
                        }
                    },
                    Status = ReservationStatus.Retirada
                }
            };

             _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservations[0]) // Verifica que el predicado funcione para al menos una reserva válida
                    )))
                .Returns(reservations);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            _reservationRepository.VerifyAll();
            Assert.IsNotNull(result);
            Assert.AreEqual(reservations.Count, result.Count);

            for (int i = 0; i < reservations.Count; i++)
            {
                Assert.AreEqual(reservations[i].PharmacyName, result[i].PharmacyName);
                Assert.AreEqual(reservations[i].Status, result[i].Status);
                Assert.AreEqual(reservations[i].Email, result[i].Email);
                Assert.AreEqual(reservations[i].Drugs.Count, result[i].Drugs.Count);
                Assert.AreEqual(reservations[i].Drugs.First().Drug.Name, result[i].Drugs.First().Drug.Name);
                Assert.AreEqual(reservations[i].Drugs.First().Quantity, result[i].Drugs.First().Quantity);
            }
        }

        [TestMethod]
        public void GetReservationsByUser_EmptyEmailOrSecret_ThrowsArgumentException()
        {
            // Arrange
            string email = "";
            string secret = "";

            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationManager.GetReservationsByUser(email, secret)
            );
            Assert.AreEqual("Debe ingresar un email y secret para consultar reservas.", ex.Message);
        }

        [TestMethod]
        public void GetReservationsByUser_NoReservations_ReturnsEmptyList()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            _reservationRepository
                .Setup(r => r.GetAllByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(new List<Reservation>());

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            _reservationRepository.VerifyAll();
            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

        [TestMethod]
        public void GetReservationsByUser_FilterByEstado_ReturnsOnlyFilteredReservations()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            ReservationStatus estadoFiltro = ReservationStatus.Confirmada;

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(_reservations[0])
                    )))
                .Returns(_reservations);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret, estadoFiltro);

            // Assert
            _reservationRepository.VerifyAll();
            Assert.IsNotNull(result);
            Assert.IsTrue(result.All(r => r.Status == estadoFiltro));
            Assert.AreEqual(1, result.Count(r => r.Status == ReservationStatus.Confirmada));
        }
    }
}