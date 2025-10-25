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
        private ReservationController _reservationController;
        private Mock<IReservationManager> _reservationManagerMock;
        private ConsultReservationRequest _consultReservationRequest;
        private List<Reservation> _reservations;
        private Pharmacy _pharmacy;
        private Drug _drug;
        private ReservationModel reservationModel;
        private Reservation reservation;
        private Pharmacy pharmacyModel;
        private Drug drugModel;

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

        [TestMethod]
        public void Create_Reservation_Ok()
        {
            //Arrange
            _reservationManagerMock
                .Setup(service => service.CreateReservation(It.IsAny<Reservation>()))
                .Returns(reservation);

            //Act
            var result = _reservationController.CreateReservation(
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
                _reservationController.CreateReservation(reservationModel)
            );
            Assert.AreEqual("User is not authorized to create a reservation.", ex.Message);
        }

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
                    Status = ReservationStatus.Pendiente,
                    FechaLimiteConfirmacion = new DateTime(2023, 10, 5, 23, 59, 59),
                    IdReferencia = null
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
            Assert.AreEqual("Pendiente", reserva.Status);
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
                    Status = ReservationStatus.Confirmada,
                    IdReferencia = "ABC12345"
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
            Assert.AreEqual("Confirmada", reserva.Status);
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
                    Status = ReservationStatus.Expirada,
                    FechaExpiracion = fechaExpiracion
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
            Assert.AreEqual("Expirada", reserva.Status);
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
                    Status = ReservationStatus.Cancelada,
                    FechaCancelacion = fechaCancelacion
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
            Assert.AreEqual("Cancelada", reserva.Status);
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
                    Status = ReservationStatus.Retirada,
                    FechaRetiro = fechaRetiro
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
            Assert.AreEqual("Retirada", reserva.Status);
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
                PharmacyName = "Farmashop"
            };

            var reservation = new Reservation()
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
                        Quantity = 1
                    }
                },
                Status = ReservationStatus.Pendiente
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
            Assert.AreEqual("Pendiente", value.Status);
        }
    }
}
