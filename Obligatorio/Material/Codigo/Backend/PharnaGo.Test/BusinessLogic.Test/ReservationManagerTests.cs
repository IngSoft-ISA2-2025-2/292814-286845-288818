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
    private Mock<IRepository<Reservation>> _reservationRepository;
    private Mock<IRepository<Pharmacy>> _pharmacyRepository;
    private Mock<IRepository<Drug>> _drugRepository;
    private Mock<IDrugManager> _drugManager = new Mock<IDrugManager>();
    private ReservationManager _reservationManager;
    private List<Reservation> _reservations;
    private Reservation _reservation;
    private Pharmacy _pharmacy;
    private Drug drugModel;
    private Drug _drug;
    private const Reservation nullReservation = null;

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
            Assert.AreEqual(reservationReturned.Status, ReservationStatus.Pendiente);
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

            _reservationRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Reservation, bool>>>()))
                .Returns(false);

            _pharmacyRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Pharmacy, bool>>>()))
                .Returns(true);

            _pharmacyRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Pharmacy, bool>>>()))
                .Returns(_pharmacy);

            _drugRepository
                .Setup(x => x.Exists(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(true);

            _drugRepository
                .Setup(x => x.GetOneByExpression(It.IsAny<Expression<Func<Drug, bool>>>()))
                .Returns(_drug);

            _reservationRepository
                .Setup(x => x.InsertOne(It.IsAny<Reservation>()))
                .Callback<Reservation>(r => r.Id = 10);

            _reservationRepository.Setup(x => x.Save());

            // Act
            var result = _reservationManager.CreateReservation(reservation);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(ReservationStatus.Pendiente, result.Status);
        }
    }
}
        
