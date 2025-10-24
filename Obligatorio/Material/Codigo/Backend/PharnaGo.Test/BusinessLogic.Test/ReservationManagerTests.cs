
using Moq;
using NuGet.Common;
using PharmaGo.BusinessLogic;
using PharmaGo.DataAccess.Repositories;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.SearchCriterias;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;
using PharmaGo.WebApi.Models.In;
using PharmaGo.WebApi.Models.Out;

namespace PharmaGo.Test.BusinessLogic.Test
{
    [TestClass]
    public class ReservationManagerTests
    {

        private Mock<IRepository<Reservation>> _reservationRepository;
        private ReservationManager _reservationManager;
        private ReservationModel reservationModel;
        private Pharmacy pharmacyModel;
        private Drug drugModel;

        [TestInitialize]
        public void InitTest()
        {
            _reservationRepository = new Mock<IRepository<Reservation>>();
            _reservationManager = new ReservationManager(_reservationRepository.Object);

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

            var reservationReturned = _reservationManager.CreateReservation(reservationModel.ToEntity());
            Assert.AreNotEqual(reservationReturned.Id, 1);

        }
    }
}
