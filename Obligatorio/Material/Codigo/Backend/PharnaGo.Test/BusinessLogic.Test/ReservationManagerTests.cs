
using Moq;
using PharmaGo.BusinessLogic;
using PharmaGo.Domain.Entities;
using PharmaGo.Exceptions;
using PharmaGo.IDataAccess;
using PharmaGo.WebApi.Controllers;
using PharmaGo.WebApi.Models.In;

namespace PharmaGo.Test.BusinessLogic.Test
{
    [TestClass]
    public class ReservationManagerTests
    {
        private Mock<IRepository<Reservation>> _reservationRepository;
        private Mock<IRepository<Pharmacy>> _pharmacyRepository;
        private ReservationManager _reservationManager;
        private Reservation _reservation;
        private Pharmacy pharmacyModel;
        private Drug drugModel;

        [TestInitialize]
        public void InitTest()
        {
            _reservationRepository = new Mock<IRepository<Reservation>>();
            _pharmacyRepository = new Mock<IRepository<Pharmacy>>();
            _reservationManager = new ReservationManager(
                _reservationRepository.Object,
                _pharmacyRepository.Object);

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
                        Quantity = 1
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
            _reservationRepository.Setup(x => x.InsertOne(It.IsAny<Reservation>()));
            _reservationRepository.Setup(x => x.Save());

            var reservationReturned = _reservationManager.CreateReservation(_reservation);
            Assert.AreNotEqual(reservationReturned.Id, 1);

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
                .Setup(x=> x.Exists(p=> p.Name == resevation.PharmacyName))
                .Returns(false);

            var ex = Assert.ThrowsException<ResourceNotFoundException>(() =>
                _reservationManager.CreateReservation(resevation));
            Assert.AreEqual("Pharmacy not found", ex.Message);
        }

    }
}
