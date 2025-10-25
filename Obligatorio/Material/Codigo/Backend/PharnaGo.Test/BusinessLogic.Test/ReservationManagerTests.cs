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
        public void GetReservationsByUser_SecretIncorrecto_ThrowsArgumentException()
        {
            // Arrange
            string email = "usuario@test.com";
            string secretIncorrecto = "secretIncorrecto";

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(_reservations[0])
                )))
                .Returns(_reservations);
                
            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationManager.GetReservationsByUser(email, secretIncorrecto)
            );
            Assert.AreEqual("El secret no coincide con el registrado para este email", ex.Message);
        }

        [TestMethod]
        public void GetReservationsByUser_Pendiente_ReturnsReservationPendienteWithOptions()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            var fechaLimite = new DateTime(2023, 10, 5, 23, 59, 59);

            var reservas = new List<Reservation>
            {
                new Reservation
                {
                    Id = 1,
                    Email = email,
                    Secret = secret,
                    Status = ReservationStatus.Pendiente,
                    FechaLimiteConfirmacion = fechaLimite,
                    IdReferencia = null
                }
            };

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservas[0])
                    )))
                .Returns(reservas);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            var reserva = result[0];
            Assert.AreEqual(ReservationStatus.Pendiente, reserva.Status);
            Assert.AreEqual(fechaLimite, reserva.FechaLimiteConfirmacion);
            Assert.IsNull(reserva.IdReferencia);
        }

        [TestMethod]
        public void GetReservationsByUser_Confirmada_ReturnsReservationWithIdReferencia()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            var idReferencia = "ABC12345";

            var reservas = new List<Reservation>
            {
                new Reservation
                {
                    Id = 2,
                    Email = email,
                    Secret = secret,
                    Status = ReservationStatus.Confirmada,
                    IdReferencia = idReferencia
                }
            };

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservas[0])
                    )))
                .Returns(reservas);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            var reserva = result[0];
            Assert.AreEqual(ReservationStatus.Confirmada, reserva.Status);
            Assert.AreEqual(idReferencia, reserva.IdReferencia);
        }
        
        [TestMethod]
        public void GetReservationsByUser_Expirada_ReturnsReservationExpiradaWithIndicaciones()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            var fechaExpiracion = new DateTime(2023, 10, 10, 23, 59, 59);

            var reservas = new List<Reservation>
            {
                new Reservation
                {
                    Id = 3,
                    Email = email,
                    Secret = secret,
                    Status = ReservationStatus.Expirada,
                    FechaExpiracion = fechaExpiracion
                }
            };

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservas[0])
                    )))
                .Returns(reservas);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            var reserva = result[0];
            Assert.AreEqual(ReservationStatus.Expirada, reserva.Status);
            Assert.AreEqual(fechaExpiracion, reserva.FechaExpiracion);
        }

        [TestMethod]
        public void GetReservationsByUser_Cancelada_ReturnsReservationCanceladaWithFecha()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            var fechaCancelacion = new DateTime(2023, 10, 8, 10, 0, 0);

            var reservas = new List<Reservation>
            {
                new Reservation
                {
                    Id = 4,
                    Email = email,
                    Secret = secret,
                    Status = ReservationStatus.Cancelada,
                    FechaCancelacion = fechaCancelacion
                }
            };

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservas[0])
                    )))
                .Returns(reservas);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            var reserva = result[0];
            Assert.AreEqual(ReservationStatus.Cancelada, reserva.Status);
            Assert.AreEqual(fechaCancelacion, reserva.FechaCancelacion);
        }

        [TestMethod]
        public void GetReservationsByUser_Retirada_ReturnsReservationRetiradaWithFechaRetiro()
        {
            // Arrange
            string email = "usuario@test.com";
            string secret = "miSecret123";
            var fechaRetiro = new DateTime(2023, 10, 12, 9, 30, 0);

            var reservas = new List<Reservation>
            {
                new Reservation
                {
                    Id = 5,
                    Email = email,
                    Secret = secret,
                    Status = ReservationStatus.Retirada,
                    FechaRetiro = fechaRetiro
                }
            };

            _reservationRepository
                .Setup(r => r.GetAllByExpression(
                    It.Is<Expression<Func<Reservation, bool>>>(expr =>
                        expr.Compile().Invoke(reservas[0])
                    )))
                .Returns(reservas);

            // Act
            var result = _reservationManager.GetReservationsByUser(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            var reserva = result[0];
            Assert.AreEqual(ReservationStatus.Retirada, reserva.Status);
            Assert.AreEqual(fechaRetiro, reserva.FechaRetiro);
        }
    }
}