using Microsoft.AspNetCore.Mvc;
using Moq;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;
using PharmaGo.IBusinessLogic;
using PharmaGo.WebApi.Controllers;
using System.Collections.Generic;
using System.Linq;

namespace PharmaGo.Test.WebApi.Test
{
    [TestClass]
    public class ReservationControllerTests
    {
        private ReservationController _reservationController = null!;
        private Mock<IReservationManager> _reservationManagerMock = null!;
        private ConsultReservationRequest _consultReservationRequest = null!;
        private List<Reservation> _reservations = null!;
        private Pharmacy _pharmacy = null!;
        private Drug _drug = null!;
        private ReservationModel reservationModel = null!;
        private Reservation _reservation = null!;
        private Pharmacy pharmacyModel = null!;
        private Drug drugModel = null!;

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

            pharmacyModel = new Pharmacy
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
                    PublicKey = "publicKeySample",
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

            _reservation = new Reservation()
            {
                Id = 1,
                PharmacyName = "Farmashop",
                Pharmacy = pharmacyModel,
                PublicKey = "publicKeySample",
                Drugs = new List<ReservationDrug>
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

        #region Create Reservation Tests

        [TestMethod]
        public void Create_Reservation_Ok()
        {
            //Arrange
            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
                .Returns(_reservation);

            //Act
            var result = _reservationController.CreateReservation(
                    reservationModel);

            //Assert
            var objectResult = result as OkObjectResult;
            var statusCode = objectResult!.StatusCode;
            var value = objectResult.Value as ReservationModelResponse;

            //Assert
            Assert.AreEqual(200, statusCode);
            Assert.AreEqual(reservationModel.PharmacyName, value!.PharmacyName);
            Assert.AreEqual(reservationModel.DrugsReserved.Count, value.DrugsReserved.Count);
            Assert.IsNotNull(value.PublicKey);
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
                _reservationController.CreateReservation(reservationModel)
            );
            Assert.AreEqual("User is not authorized to create a reservation.", ex.Message);
        }

        #endregion Create Reservation Tests


        #region Get Reservations Tests
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
                Assert.AreEqual(_reservations[i].Status.ToString(), value[i].Status);

                var reservationDrugs = _reservations[i].Drugs.ToList();

                for (int j = 0; j < reservationDrugs.Count; j++)
                {
                    Assert.AreEqual(reservationDrugs[j].Drug.Name, value[i].ReservedDrugs[j].DrugName);
                    Assert.AreEqual(reservationDrugs[j].Quantity, value[i].ReservedDrugs[j].Quantity);
                }
            }
        }

        [TestMethod]
        public void GetReservationsByUser_EmptyEmailAndSecret_ThrowsArgumentException()
        {
            // Arrange
            var emptyRequest = new ConsultReservationRequest
            {
                Email = "",
                Secret = ""
            };

            _reservationManagerMock
                .Setup(m => m.GetReservationsByUser("", ""))
                .Throws(new ArgumentException("Debe ingresar un email y secret para consultar reservas."));

            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationController.GetReservations(emptyRequest)
            );
            Assert.AreEqual("Debe ingresar un email y secret para consultar reservas.", ex.Message);
        }

        [TestMethod]
        public void GetReservationsByUser_NoReservations_ReturnsEmptyListAndOk()
        {
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(new List<Reservation>());

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(0, value.Count);
        }

        [TestMethod]
        public void GetReservationsByUser_SecretIncorrecto_ThrowsArgumentException()
        {
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "secretIncorrecto"
            };

            _reservationManagerMock
                .Setup(m => m.GetReservationsByUser(request.Email, request.Secret))
                .Throws(new ArgumentException("El secret no coincide con el registrado para este email"));

            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationController.GetReservations(request)
            );
            Assert.AreEqual("El secret no coincide con el registrado para este email", ex.Message);
        }

        [TestMethod]
        public void GetReservationsByUser_Pendiente_ReturnsReservationPendienteWithOptions()
        {
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var reservasPendiente = new List<Reservation>
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
                    Status = ReservationStatus.Pending,
                    LimitConfirmationDate = new DateTime(2023, 10, 5, 23, 59, 59),
                    ReferenceId = null
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservasPendiente);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(1, value.Count);

            var reserva = value[0];
            Assert.AreEqual("Pending", reserva.Status);
            Assert.AreEqual("Farmashop", reserva.PharmacyName);
            Assert.IsNull(reserva.IdReferencia);
            Assert.AreEqual(new DateTime(2023, 10, 5, 23, 59, 59), reserva.FechaLimiteConfirmacion);
        }

        [TestMethod]
        public void GetReservationsByUser_Confirmada_ReturnsReservationWithIdReferencia()
        {
            // Abarca tambien para gestion de estados
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var reservasConfirmada = new List<Reservation>
            {
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
                    Status = ReservationStatus.Confirmed,
                    ReferenceId = "ABC12345"
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservasConfirmada);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(1, value.Count);

            var reserva = value[0];
            Assert.AreEqual("Confirmed", reserva.Status);
            Assert.AreEqual("Farmacia Central", reserva.PharmacyName);
            Assert.AreEqual("ABC12345", reserva.IdReferencia);
        }

        [TestMethod]
        public void GetReservationsByUser_Expirada_ReturnsReservationWithMensajeYFechaExpiracion()
        {
            // Arrange
            // Abarca tambien para gestion de estados
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var fechaExpiracion = new DateTime(2023, 10, 10, 23, 59, 59);

            var reservasExpirada = new List<Reservation>
            {
                new Reservation
                {
                    Id = 3,
                    PharmacyName = "Farmacia Sur",
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
                    Status = ReservationStatus.Expired,
                    ExpirationDate = fechaExpiracion
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservasExpirada);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(1, value.Count);

            var reserva = value[0];
            Assert.AreEqual("Expired", reserva.Status);
            Assert.AreEqual("Farmacia Sur", reserva.PharmacyName);
            Assert.AreEqual(fechaExpiracion, reserva.FechaExpiracion);
        }

        [TestMethod]
        public void GetReservationsByUser_Cancelada_ReturnsReservationCanceladaWithFecha()
        {
            // Abarca tambien para gestion de estados
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var fechaCancelacion = new DateTime(2023, 10, 8, 10, 0, 0);

            var reservasCancelada = new List<Reservation>
            {
                new Reservation
                {
                    Id = 4,
                    PharmacyName = "Farmacia Norte",
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
                    Status = ReservationStatus.Canceled,
                    CancellationDate = fechaCancelacion
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservasCancelada);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(1, value.Count);

            var reserva = value[0];
            Assert.AreEqual("Canceled", reserva.Status);
            Assert.AreEqual("Farmacia Norte", reserva.PharmacyName);
            Assert.AreEqual(fechaCancelacion, reserva.FechaCancelacion);
        }

        [TestMethod]
        public void GetReservationsByUser_Retirada_ReturnsReservationRetiradaWithFechaRetiro()
        {
            // Abarca tambien para gestion de estados
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var fechaRetiro = new DateTime(2023, 10, 12, 9, 30, 0);

            var reservasRetirada = new List<Reservation>
            {
                new Reservation
                {
                    Id = 5,
                    PharmacyName = "Farmacia Este",
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
                    Status = ReservationStatus.Withdrawal,
                    RetirementDate = fechaRetiro
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservasRetirada);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(1, value.Count);

            var reserva = value[0];
            Assert.AreEqual("Withdrawal", reserva.Status);
            Assert.AreEqual("Farmacia Este", reserva.PharmacyName);
            Assert.AreEqual(fechaRetiro, reserva.FechaRetiro);
        }

        [TestMethod]
        public void Create_Reservation_AssignsPendingStatus()
        {
            // Arrange
            var reservationModel = new ReservationModel()
            {
                DrugsReserved = new List<ReservationDrugModel>
                {
                    new ReservationDrugModel
                    {
                        DrugName = "Aspirina",
                        DrugQuantity = 1
                    }
                },
                PharmacyName = "Farmashop",
                Email = "test@example.com",
                Secret = "secret123"
            };

            var reservation = new Reservation()
            {
                Id = 1,
                PharmacyName = "Farmashop",
                Pharmacy = _pharmacy,
                Email = "test@example.com",
                Secret = "secret123",
                Status = ReservationStatus.Pending,
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        Drug = _drug,
                        Quantity = 1
                    }
                }
            };

            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
                .Returns(reservation);

            // Act
            var result = _reservationController.CreateReservation(reservationModel);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            var value = objectResult.Value as ReservationModelResponse;
            Assert.IsNotNull(value);
            Assert.AreEqual("Pending", value.Status);
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

        [TestMethod]
        public void CancelReservation_WithMissingEmail_ThrowsArgumentException()
        {
            // Arrange
            string email = "";
            string secret = "abc123";

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret))
                .Throws(new ArgumentException("Se requiere un correo válido"));

            // Act & Assert
            var ex = Assert.ThrowsException<ArgumentException>(() =>
                _reservationController.CancelReservation(email, secret)
            );
            Assert.AreEqual("Se requiere un correo válido", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WithExpiredReservation_ThrowsInvalidOperationException()
        {
            // Arrange
            string email = "vencida@example.com";
            string secret = "oldSecret";

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret))
                .Throws(new InvalidOperationException("No se puede cancelar una reserva expirada"));

            // Act & Assert
            var ex = Assert.ThrowsException<InvalidOperationException>(() =>
                _reservationController.CancelReservation(email, secret)
            );
            Assert.AreEqual("No se puede cancelar una reserva expirada", ex.Message);
        }

        [TestMethod]
        public void CancelReservation_WhenAlreadyCancelled_ReturnsOkIdempotent()
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

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret))
                .Returns(alreadyCancelledReservation);

            // Act
            var result = _reservationController.CancelReservation(email, secret);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);
        }

        [TestMethod]
        public void CancelReservation_WithValidEmailAndSecret_ReturnsOkAndCancelsReservation()
        {
            // Arrange
            string email = "cliente@example.com";
            string secret = "abc123";

            var cancelledReservation = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Canceled,
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        DrugId = 1,
                        Drug = _drug,
                        Quantity = 1
                    }
                }
            };

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret))
                .Returns(cancelledReservation);

            // Act
            var result = _reservationController.CancelReservation(email, secret);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
        }

        [TestMethod]
        public void CancelReservation_WithMultipleReservationsSameEmail_CancelsOnlyMatchingSecret()
        {
            // Arrange
            string email = "multi@example.com";
            string secret1 = "s1";

            var reservation1 = new Reservation
            {
                Id = 1,
                Email = email,
                Secret = secret1,
                PharmacyName = "Farmashop",
                Status = ReservationStatus.Canceled,
                Drugs = new List<ReservationDrug>()
            };

            _reservationManagerMock
                .Setup(service => service.CancelReservation(email, secret1))
                .Returns(reservation1);

            // Act
            var result = _reservationController.CancelReservation(email, secret1);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            var value = objectResult.Value as ReservationModelResponse;
            Assert.IsNotNull(value);
            Assert.AreEqual("Farmashop", value.PharmacyName);
        }

        [TestMethod]
        public void CreateReservation_AssignsCorrectStatus()
        {
            // Arrange
            var reservationModel = new ReservationModel()
            {
                DrugsReserved = new List<ReservationDrugModel>
                {
                    new ReservationDrugModel
                    {
                        DrugName = "Aspirina",
                        DrugQuantity = 1
                    }
                },
                PharmacyName = "Farmashop",
                Email = "usuario@test.com",
                Secret = "secret123"
            };

            var reservation = new Reservation()
            {
                Id = 1,
                PharmacyName = "Farmashop",
                Pharmacy = _pharmacy,
                Email = "usuario@test.com",
                Secret = "secret123",
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        DrugId = 1,
                        Drug = _drug,
                        Quantity = 1
                    }
                },
                Status = ReservationStatus.Pending
            };

            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
                .Returns(reservation);

            // Act
            var result = _reservationController.CreateReservation(reservationModel);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as ReservationModelResponse;
            Assert.IsNotNull(value);
            Assert.AreEqual("Pending", value.Status);
        }

        [TestMethod]
        public void GetReservationsByUser_MultipleStates_ReturnsAllWithCorrectStatusAndIdReferencia()
        {
            // Arrange
            var request = new ConsultReservationRequest
            {
                Email = "usuario@test.com",
                Secret = "miSecret123"
            };

            var reservas = new List<Reservation>
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
                    Status = ReservationStatus.Pending,
                    ReferenceId = null
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
                    Status = ReservationStatus.Confirmed,
                    ReferenceId = "CONF123"
                },
                new Reservation
                {
                    Id = 3,
                    PharmacyName = "Farmacia Sur",
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
                    Status = ReservationStatus.Expired
                },
                new Reservation
                {
                    Id = 4,
                    PharmacyName = "Farmacia Norte",
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
                    Status = ReservationStatus.Canceled
                },
                new Reservation
                {
                    Id = 5,
                    PharmacyName = "Farmacia Este",
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
                    Status = ReservationStatus.Withdrawal
                }
            };

            _reservationManagerMock
                .Setup(service => service.GetReservationsByUser(request.Email, request.Secret))
                .Returns(reservas);

            // Act
            var result = _reservationController.GetReservations(request);

            // Assert
            var objectResult = result as OkObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(200, objectResult.StatusCode);

            var value = objectResult.Value as List<ReservationResponse>;
            Assert.IsNotNull(value);
            Assert.AreEqual(reservas.Count, value.Count);

            for (int i = 0; i < reservas.Count; i++)
            {
                Assert.AreEqual(reservas[i].PharmacyName, value[i].PharmacyName);
                Assert.AreEqual(reservas[i].Status.ToString(), value[i].Status);

                if (reservas[i].Status == ReservationStatus.Confirmed)
                    Assert.IsNotNull(value[i].IdReferencia, "La reserva confirmada debe tener ReferenceId");
                if (reservas[i].Status == ReservationStatus.Pending)
                    Assert.IsNull(value[i].IdReferencia, "La reserva pendiente no debe tener ReferenceId");
            }
        }
        #endregion Get Reservations Tests

        #region Validate Reservation Tests
        [TestMethod]
        public void ValidateReservation_Ok()
        {
            var publicKey = "publicKeySample";
            var reservation = _reservation;
            _reservationManagerMock
                .Setup(service => service.ValidateReservation(publicKey))
                .Returns(reservation);

            var result = _reservationController.ValidateReservation(publicKey);

            var objectResult = result as OkObjectResult;
            var statusCode = objectResult!.StatusCode;
            var value = objectResult.Value as ReservationModelResponse;
            Assert.AreEqual(200, statusCode);
            Assert.AreEqual(reservationModel.PharmacyName, value!.PharmacyName);
            Assert.AreEqual(reservationModel.DrugsReserved.Count, value.DrugsReserved.Count);
            Assert.IsNotNull(value.PublicKey);
            for (int i = 0; i < reservationModel.DrugsReserved.Count; i++)
            {
                Assert.AreEqual(reservationModel.DrugsReserved[i].DrugName, value.DrugsReserved[i].DrugName);
                Assert.AreEqual(reservationModel.DrugsReserved[i].DrugQuantity, value.DrugsReserved[i].DrugQuantity);
            }
        }
        #endregion Validate Reservation Tests

        #region Confirm Reservation Tests
        [TestMethod]
        [ExpectedException(typeof(KeyNotFoundException))]
        public void ConfirmReservation_NotFound_ThrowsException()
        {
            // Arrange
            var referenceId = "NOEXISTE";
            _reservationManagerMock
                .Setup(m => m.ConfirmReservation(referenceId))
                .Throws(new KeyNotFoundException("No se encontró la reserva"));

            // Act
            var result = _reservationController.ConfirmReservation(referenceId);

            // Assert - ExpectedException
        }

        [TestMethod]
        public void ConfirmReservation_AlreadyConfirmed_ReturnsOk()
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
                Pharmacy = _pharmacy,
                PublicKey = "PUBLIC123",
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug { DrugId = 1, Drug = _drug, Quantity = 2 }
                }
            };

            _reservationManagerMock
                .Setup(m => m.ConfirmReservation(referenceId))
                .Returns(alreadyConfirmedReservation);

            // Act
            var result = _reservationController.ConfirmReservation(referenceId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var okResult = result as OkObjectResult;
            var response = okResult!.Value as ReservationModelResponse;
            Assert.IsNotNull(response);
            Assert.AreEqual("Farmashop", response.PharmacyName);
            Assert.AreEqual("Confirmed", response.Status);
        }

        [TestMethod]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ConfirmReservation_CanceledReservation_ThrowsInvalidOperationException()
        {
            // Arrange
            var referenceId = "REF-CANCELED";
            _reservationManagerMock
                .Setup(m => m.ConfirmReservation(referenceId))
                .Throws(new InvalidOperationException("No se puede confirmar una reserva cancelada"));

            // Act
            var result = _reservationController.ConfirmReservation(referenceId);

            // Assert - ExpectedException
        }

        [TestMethod]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ConfirmReservation_ExpiredReservation_ThrowsInvalidOperationException()
        {
            // Arrange
            var referenceId = "REF-EXPIRED";
            _reservationManagerMock
                .Setup(m => m.ConfirmReservation(referenceId))
                .Throws(new InvalidOperationException("No se puede confirmar una reserva expirada"));

            // Act
            var result = _reservationController.ConfirmReservation(referenceId);

            // Assert - ExpectedException
        }

        [TestMethod]
        public void ConfirmReservation_PendingReservation_ReturnsOkWithConfirmedReservation()
        {
            // Arrange
            var referenceId = "REF-SUCCESS";
            var confirmedReservation = new Reservation
            {
                Id = 1,
                ReferenceId = referenceId,
                Email = "test@example.com",
                Status = ReservationStatus.Confirmed,
                PharmacyName = "Farmashop",
                Pharmacy = _pharmacy,
                PublicKey = "PUBLIC123",
                LimitConfirmationDate = DateTime.Now.AddDays(1),
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug { DrugId = 1, Drug = _drug, Quantity = 2 }
                }
            };

            _reservationManagerMock
                .Setup(m => m.ConfirmReservation(referenceId))
                .Returns(confirmedReservation);

            // Act
            var result = _reservationController.ConfirmReservation(referenceId);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var okResult = result as OkObjectResult;
            var response = okResult!.Value as ReservationModelResponse;
            Assert.IsNotNull(response);
            Assert.AreEqual("Farmashop", response.PharmacyName);
            Assert.AreEqual("Confirmed", response.Status);
        }
        #endregion Confirm Reservation Tests
    }
}
