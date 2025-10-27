using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using PharmaGo.BusinessLogic;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using PharmaGo.IDataAccess;
using PharmaGo.IBusinessLogic;
using PharmaGo.Exceptions;
using PharmaGo.Domain.SearchCriterias;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace PharmaGo.Test.BusinessLogic.Test
{
    [TestClass]
    public class ReservationManagerTests
    {
        private Mock<IRepository<Reservation>> _reservationRepository = null!;
        private Mock<IRepository<Pharmacy>> _pharmacyRepository = null!;
        private Mock<IRepository<Drug>> _drugRepository = null!;
        private Mock<IDrugManager> _drugManager = new Mock<IDrugManager>();
        private ReservationManager _reservationManager = null!;
        private List<Reservation> _reservations = null!;
        private Reservation _reservation = null!;
        private Pharmacy _pharmacy = null!;
        private Drug drugModel = null!;
        private Drug _drug = null!;

        [TestInitialize]
        public void InitTest()
        {
            _reservationRepository = new Mock<IRepository<Reservation>>();
            _pharmacyRepository = new Mock<IRepository<Pharmacy>>();
            _drugRepository = new Mock<IRepository<Drug>>();
            _reservationManager = new ReservationManager(
                _reservationRepository.Object,
                _pharmacyRepository.Object,
                _drugRepository.Object);

            _pharmacy = new Pharmacy
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
                Pharmacy = _pharmacy
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
                    Status = ReservationStatus.Pending
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
                    Status = ReservationStatus.Confirmed
                }
            };

            _reservation = new Reservation
            {
                Email = "test@email.com",
                Secret = "1234",
                PharmacyName = "Farmashop",
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        Drug = new Drug { Name = "Aspirina" },
                        Quantity = 2
                    }
                }
            };
        }

        [TestCleanup]
        public void Cleanup()
        {
            _reservationRepository.VerifyAll();
        }

        [TestMethod]
        public void CreateReservationOk()
        {
            var resevation = _reservation;

            _reservationRepository
                .Setup(x => x.Exists((r =>
                    r.Email == resevation.Email
                    && r.Secret != resevation.Secret)))
                .Returns(false);

            _pharmacyRepository
                .Setup(x => x.Exists(p => p.Name == resevation.PharmacyName))
                .Returns(true);


            _pharmacyRepository
                .Setup(x => x.GetOneByExpression(p => p.Name == resevation.PharmacyName))
                .Returns(_pharmacy);

            _drugRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(true);


            _drugRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(drugModel);

            _reservationRepository
                .Setup(x => x.InsertOne(It.IsAny<Reservation>()))
                .Callback<Reservation>(r => r.Id = 2);

            _reservationRepository.Setup(x => x.Save());

            var reservationReturned = _reservationManager.CreateReservation(resevation);
            Assert.AreNotEqual(reservationReturned.Id, 1);
            Assert.AreEqual(reservationReturned.Email, resevation.Email);
            Assert.AreEqual(reservationReturned.Secret, resevation.Secret);
            Assert.AreEqual(reservationReturned.PharmacyName, resevation.PharmacyName);
            Assert.AreEqual(reservationReturned.Drugs.Count, resevation.Drugs.Count);
            Assert.AreEqual(reservationReturned.Status, ReservationStatus.Pending);
            Assert.IsNotNull(reservationReturned.PrivateKey);
            Assert.IsNotNull(reservationReturned.PublicKey);
            Assert.AreEqual(198, drugModel.Stock);
        }

        [TestMethod]
        public void CreateReservation_WhenEmailExistsButSecretIsDifferent_ThrowsUnautharizedException()
        {
            var resevation = _reservation;
            _reservationRepository
                .Setup(x => x.Exists((r =>
                    r.Email == resevation.Email
                    && r.Secret != resevation.Secret)))
                .Returns(true);

            var ex = Assert.ThrowsException<UnauthorizedAccessException>(() =>
                _reservationManager.CreateReservation(resevation));
            Assert.AreEqual("User is not authorized to create a reservation.", ex.Message);
        }

        [TestMethod]
        public void CreateReservation_WhenInvalidPharmacy_ThrowsNotFoundException()
        {
            var resevation = _reservation;
            _reservationRepository
                .Setup(x => x.Exists((r =>
                    r.Email == resevation.Email
                    && r.Secret != resevation.Secret)))
                .Returns(false);

            _pharmacyRepository
                .Setup(x => x.Exists(p => p.Name == resevation.PharmacyName))
                .Returns(false);

            var ex = Assert.ThrowsException<ResourceNotFoundException>(() =>
                _reservationManager.CreateReservation(resevation));
            Assert.AreEqual("The pharmacy for the reservation does not exist.", ex.Message);
        }

        [TestMethod]
        public void CreateReservation_WhenInvalidDrug_ThrowsNotFoundException()
        {
            var resevation = _reservation;
            _reservationRepository
                .Setup(x => x.Exists((r =>
                    r.Email == resevation.Email
                    && r.Secret != resevation.Secret)))
                .Returns(false);

            _pharmacyRepository
                .Setup(x => x.Exists(p => p.Name == resevation.PharmacyName))
                .Returns(true);

            _pharmacyRepository
                .Setup(x => x.GetOneByExpression(p => p.Name == resevation.PharmacyName))
                .Returns(_pharmacy);

            _drugRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(false);

            var ex = Assert.ThrowsException<ResourceNotFoundException>(() =>
                _reservationManager.CreateReservation(resevation));
            Assert.AreEqual(
                "The drug Aspirina for the reservation does not exist in the pharmacy Farmashop.",
                ex.Message
            );
        }

        [TestMethod]
        public void CreateReservation_WhenDrugHasNoStock_ThrowsNotFoundException()
        {
            var drugModelNoStock = new Drug
            {
                Id = 1,
                Code = "ASP-001",
                Name = "Aspirina",
                Symptom = "Dolor de cabeza",
                Quantity = 1,
                Price = 50,
                Stock = 0,
                Prescription = false,
                Deleted = false,
                UnitMeasure = new UnitMeasure { Id = 1, Name = "mg", Deleted = false },
                Presentation = new Presentation { Id = 1, Name = "Tableta", Deleted = false },
                Pharmacy = _pharmacy
            };
            var resevation = _reservation;
            _reservationRepository
                .Setup(x => x.Exists((r =>
                    r.Email == resevation.Email
                    && r.Secret != resevation.Secret)))
                .Returns(false);

            _pharmacyRepository
                .Setup(x => x.Exists(p => p.Name == resevation.PharmacyName))
                .Returns(true);

            _pharmacyRepository
                .Setup(x => x.GetOneByExpression(p => p.Name == resevation.PharmacyName))
                .Returns(_pharmacy);

            _drugRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(true);

            _drugRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(drugModelNoStock);

            var ex = Assert.ThrowsException<InvalidResourceException>(() =>
                _reservationManager.CreateReservation(resevation));

            Assert.AreEqual(
                "The drug Aspirina for the reservation has insufficient stock.",
                ex.Message
            );
        }

        [TestMethod]
        public void GetReservationsByUser_Ok()
        {
            // Abarca tambien para gestion de estados
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
                    Status = ReservationStatus.Pending
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
                    Status = ReservationStatus.Confirmed
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
                    Status = ReservationStatus.Expired
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
                    Status = ReservationStatus.Canceled
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
                    Status = ReservationStatus.Withdrawal
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

                if (reservations[i].Status == ReservationStatus.Confirmed)
                Assert.IsNotNull(result[i].ReferenceId, "La reserva confirmada debe tener ReferenceId");
                if (reservations[i].Status == ReservationStatus.Pending)
                Assert.IsNull(result[i].ReferenceId, "La reserva pendiente no debe tener ReferenceId");
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
                    Status = ReservationStatus.Pending,
                    LimitConfirmationDate = fechaLimite,
                    ReferenceId = null
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
            Assert.AreEqual(ReservationStatus.Pending, reserva.Status);
            Assert.AreEqual(fechaLimite, reserva.LimitConfirmationDate);
            Assert.IsNull(reserva.ReferenceId);
        }

        [TestMethod]
        public void GetReservationsByUser_Confirmada_ReturnsReservationWithIdReferencia()
        {
            // Abarca tambien para gestion de estados
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
                    Status = ReservationStatus.Confirmed,
                    ReferenceId = idReferencia
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
            Assert.AreEqual(ReservationStatus.Confirmed, reserva.Status);
            Assert.AreEqual(idReferencia, reserva.ReferenceId);
        }

        [TestMethod]
        public void GetReservationsByUser_Expirada_ReturnsReservationWithMensajeYFechaExpiracion()
        {
            // Abarca tambien para gestion de estados
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
                    Status = ReservationStatus.Expired,
                    ExpirationDate = fechaExpiracion
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
            Assert.AreEqual(ReservationStatus.Expired, reserva.Status);
            Assert.AreEqual(fechaExpiracion, reserva.ExpirationDate);
        }

        [TestMethod]
        public void GetReservationsByUser_Cancelada_ReturnsReservationCanceladaWithFecha()
        {
            // Abarca tambien para gestion de estados
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
                    Status = ReservationStatus.Canceled,
                    CancellationDate = fechaCancelacion
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
            Assert.AreEqual(ReservationStatus.Canceled, reserva.Status);
            Assert.AreEqual(fechaCancelacion, reserva.CancellationDate);
        }

        [TestMethod]
        public void GetReservationsByUser_Retirada_ReturnsReservationRetiradaWithFechaRetiro()
        {
            // Abarca tambien para gestion de estados
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
                    Status = ReservationStatus.Withdrawal,
                    RetirementDate = fechaRetiro
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
            Assert.AreEqual(ReservationStatus.Withdrawal, reserva.Status);
            Assert.AreEqual(fechaRetiro, reserva.RetirementDate);
        }

        [TestMethod]
        public void CreateReservation_AssignsPendingStatus()
        {
            // Arrange
            var reservation = new Reservation
            {
                Email = "usuario@test.com",
                Secret = "secret123",
                PharmacyName = "Farmashop",
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        Drug = new Drug { Name = "Aspirina" },
                        Quantity = 1
                    }
                }
            };

            var pharmacy = new Pharmacy { Name = "Farmashop" };
            var drug = new Drug { Name = "Aspirina", Stock = 10, Pharmacy = pharmacy };

            _pharmacyRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Pharmacy, bool>>>()))
                .Returns(true);

            _pharmacyRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Pharmacy, bool>>>()))
                .Returns(pharmacy);

            _drugRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(true);

            _drugRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(drug);

            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            _reservationRepository
                .Setup(x => x.InsertOne(It.IsAny<Reservation>()));

            _reservationRepository
                .Setup(x => x.Save());

            _drugRepository
                .Setup(x => x.UpdateOne(It.IsAny<Drug>()));

            // Act
            var result = _reservationManager.CreateReservation(reservation);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(ReservationStatus.Pending, result.Status);
        }

        // ============================
        // TDD RED: Cancel Reservation - Escenario 1: No existe reserva
        // ============================

        [TestMethod]
        public void CancelReservation_WithNonExistentReservation_ThrowsKeyNotFoundException()
        {
            // Arrange
            string email = "sinreserva@example.com";
            string secret = "cualquiera";

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(() => null!);

            // Act & Assert
            var ex = Assert.ThrowsException<KeyNotFoundException>(() =>
                _reservationManager.CancelReservation(email, secret)
            );
            Assert.AreEqual("No existe una reserva asociada a ese correo", ex.Message);
        }

        // ============================
        // TDD RED: Cancel Reservation - Escenario 2: Secret incorrecto
        // ============================

        [TestMethod]
        public void CancelReservation_WithInvalidSecret_ThrowsUnauthorizedException()
        {
            // Arrange
            string email = "cliente@example.com";
            string wrongSecret = "equivocado";

            // Simular que existe una reserva con ese email pero con secret diferente
            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(true);

            // Act & Assert
            var ex = Assert.ThrowsException<UnauthorizedAccessException>(() =>
                _reservationManager.CancelReservation(email, wrongSecret)
            );
            Assert.AreEqual("Secret inválido para ese correo", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WithEmptyEmail_ThrowsArgumentException()
        {
            // Arrange
            string email = "";
            string secret = "abc123";

            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationManager.CancelReservation(email, secret)
            );
            Assert.AreEqual("Se requiere un correo válido", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WithExpiredReservation_ThrowsInvalidOperationException()
        {
            // Arrange
            string email = "vencida@example.com";
            string secret = "oldSecret";

            var expiredReservation = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Expired,
                Drugs = new List<ReservationDrug>()
            };

            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(expiredReservation);

            // Act & Assert
            var ex = Assert.ThrowsException<InvalidOperationException>(() =>
                _reservationManager.CancelReservation(email, secret)
            );
            Assert.AreEqual("No se puede cancelar una reserva expirada", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WhenAlreadyCancelled_ReturnsReservationIdempotent()
        {
            // Arrange
            string email = "cliente@example.com";
            string secret = "abc123";

            var alreadyCancelledReservation = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Canceled,
                Drugs = new List<ReservationDrug>()
            };

            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(alreadyCancelledReservation);

            // Act
            var result = _reservationManager.CancelReservation(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Cancelled", result.Status);
            Assert.AreEqual(email, result.Email);
            Assert.AreEqual(secret, result.Secret);
        }

        [TestMethod]
        public void CancelReservation_WithValidEmailAndSecret_SuccessfullyCancelsReservation()
        {
            // Arrange
            string email = "cliente@example.com";
            string secret = "abc123";

            var activeReservation = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Pending,
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        Drug = drugModel,
                        Quantity = 2
                    }
                }
            };

            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(activeReservation);

            _reservationRepository
                .Setup(x => x.UpdateOne(It.IsAny<Reservation>()));

            _reservationRepository
                .Setup(x => x.Save());

            // Act
            var result = _reservationManager.CancelReservation(email, secret);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(ReservationStatus.Canceled, result.Status);
            Assert.AreEqual(email, result.Email);
            Assert.AreEqual(secret, result.Secret);
            Assert.AreEqual("Farmashop", result.PharmacyName);
            Assert.AreEqual(1, result.Drugs.Count);

            _reservationRepository.Verify(x => x.UpdateOne(It.IsAny<Reservation>()), Times.Once);
            _reservationRepository.Verify(x => x.Save(), Times.Once);
        }

        #region Validate Reservation Tests
        [TestMethod]
        public void ValidateReservation_Ok()
        {
            // Arrange
            string publicKey = "validPublicKey";
            var reservation = _reservation;
            reservation.Status = ReservationStatus.Confirmed;

            _reservationRepository
                .Setup(r => r.Exists(r => r.PublicKey == publicKey))
                .Returns(true);

            _reservationRepository
                .Setup(r => r.GetOneByExpression(r => r.PublicKey == publicKey))
                .Returns(reservation);

            // Act
            var result = _reservationManager.ValidateReservation(publicKey);

            // Assert
            _reservationRepository.VerifyAll();
            Assert.IsNotNull(result);
            Assert.AreEqual(reservation.Email, result.Email);
            Assert.AreEqual(reservation.Secret, result.Secret);
            Assert.AreEqual(reservation.PharmacyName, result.PharmacyName);
            Assert.AreEqual(reservation.Drugs.Count, result.Drugs.Count);
            Assert.AreEqual(ReservationStatus.Withdrawal, result.Status);
        }

        [TestMethod]
        public void ValidateReservation_ConClaveIncorrecta_ThrowsException()
        {
            string publicKey = "validPublicKey";
            var reservation = _reservation;

            _reservationRepository
                .Setup(r => r.Exists(r => r.PublicKey == publicKey))
                .Returns(false);

            var ex = Assert.ThrowsException<ResourceNotFoundException>(() =>
               _reservationManager.ValidateReservation(publicKey));

            Assert.AreEqual(
                "No reservation found with the provided public key.",
                ex.Message
            );
        }

        [TestMethod]
        public void ValidateReservation_WithExpiredReservation_ThrowsException()
        {
            string publicKey = "expired-publicKey";
            var reservation = _reservation;
            reservation.ExpirationDate = System.DateTime.Now.AddHours(-1);

            _reservationRepository
                .Setup(r => r.Exists(r => r.PublicKey == publicKey))
                .Returns(true);

            _reservationRepository
                .Setup(r => r.GetOneByExpression(r => r.PublicKey == publicKey))
                .Returns(reservation);

            var ex = Assert.ThrowsException<InvalidResourceException>(() =>
               _reservationManager.ValidateReservation(publicKey));

            Assert.AreEqual(
                "The reservation has expired and cannot be validated.",
                ex.Message
            );
        }


        [TestMethod]
        public void ValidateReservation_WithCancelledReservation_ThrowsException()
        {
            string publicKey = "expired-publicKey";
            var reservation = _reservation;
            reservation.Status = ReservationStatus.Canceled;

            _reservationRepository
                .Setup(r => r.Exists(r => r.PublicKey == publicKey))
                .Returns(true);

            _reservationRepository
                .Setup(r => r.GetOneByExpression(r => r.PublicKey == publicKey))
                .Returns(reservation);

            var ex = Assert.ThrowsException<InvalidResourceException>(() =>
               _reservationManager.ValidateReservation(publicKey));

            Assert.AreEqual(
                "The reservation is not confirmed.",
                ex.Message
            );
        }
        #endregion Validate Reservation Tests

        [TestMethod]
        public void CancelReservation_WithMultipleReservationsSameEmail_CancelsOnlyMatchingSecret()
        {
            // Arrange
            string email = "multi@example.com";
            string secret1 = "s1";

            // Reserva que queremos cancelar (con secret "s1")
            var reservation1 = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret1,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Pending,
                Drugs = new List<ReservationDrug>()
            };

            // Simular que NO existe otra reserva con email igual pero secret diferente
            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            // Retornar solo la reserva con el secret correcto
            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(reservation1);

            _reservationRepository
                .Setup(x => x.UpdateOne(It.IsAny<Reservation>()));

            _reservationRepository
                .Setup(x => x.Save());

            // Act
            var result = _reservationManager.CancelReservation(email, secret1);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(ReservationStatus.Canceled, result.Status);
            Assert.AreEqual(email, result.Email);
            Assert.AreEqual(secret1, result.Secret);
            Assert.AreEqual(1, result.Id);

            // Verificar que se actualizó solo una reserva
            _reservationRepository.Verify(x => x.UpdateOne(It.IsAny<Reservation>()), Times.Once);
            _reservationRepository.Verify(x => x.Save(), Times.Once);
        }

        #region Confirm Reservation Tests
        [TestMethod]
        [ExpectedException(typeof(KeyNotFoundException))]
        public void ConfirmReservation_WithNonExistentReservation_ThrowsKeyNotFoundException()
        {
            // Arrange
            var referenceId = "NOEXISTE";

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(() => null!);

            // Act
            _reservationManager.ConfirmReservation(referenceId);

            // Assert - ExpectedException
        }

        [TestMethod]
        public void ConfirmReservation_WithAlreadyConfirmedReservation_ReturnsReservationUnchanged()
        {
            // Arrange
            var referenceId = "REF-001";
            var alreadyConfirmedReservation = new Reservation
            {
                Id = 1,
                ReferenceId = referenceId,
                Email = "test@example.com",
                Status = ReservationStatus.Confirmed,
                PharmacyName = "Farmashop",
                PublicKey = "PUBLIC123",
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug { DrugId = 1, Quantity = 2 }
                }
            };

            _reservationRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(alreadyConfirmedReservation);

            // Act
            var result = _reservationManager.ConfirmReservation(referenceId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(ReservationStatus.Confirmed, result.Status);
            Assert.AreEqual(referenceId, result.ReferenceId);
            _reservationRepository.Verify(x => x.UpdateOne(It.IsAny<Reservation>()), Times.Never);
        }
        #endregion Confirm Reservation Tests
    }
}

