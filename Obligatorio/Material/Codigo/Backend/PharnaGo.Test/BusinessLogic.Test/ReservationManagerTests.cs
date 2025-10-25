
using System.Linq.Expressions;
using Moq;
using PharmaGo.BusinessLogic;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.SearchCriterias;
using PharmaGo.Exceptions;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;

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
        private Reservation _reservation;
        private Pharmacy _pharmacy;
        private Drug drugModel;

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

            _reservation = new Reservation
            {
                Email = "test@email.com",
                Secret = "1234",
                PharmacyName = "Farmashop",
                ReservationDrugs = new List<ReservationDrug>
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
            Assert.AreEqual(reservationReturned.ReservationDrugs.Count, resevation.ReservationDrugs.Count);
            Assert.AreEqual(reservationReturned.Status, "Pending");
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
                .Returns((Reservation)null);

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
                Status = "Expired",
                ReservationDrugs = new List<ReservationDrug>()
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
                Status = "Cancelled",
                ReservationDrugs = new List<ReservationDrug>()
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
                Status = "Pending",
                ReservationDrugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        DrugId = 1,
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
            Assert.AreEqual("Cancelled", result.Status);
            Assert.AreEqual(email, result.Email);
            Assert.AreEqual(secret, result.Secret);
            Assert.AreEqual("Farmashop", result.PharmacyName);
            Assert.AreEqual(1, result.ReservationDrugs.Count);

            _reservationRepository.Verify(x => x.UpdateOne(It.IsAny<Reservation>()), Times.Once);
            _reservationRepository.Verify(x => x.Save(), Times.Once);
        }
    }
}
