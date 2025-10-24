using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PharmaGo.DataAccess;
using PharmaGo.DataAccess.Repositories;
using PharmaGo.Domain.Entities;

namespace PharmaGo.Test.DataAccess.Test
{
    [TestClass]
    public class ReservationRepositoryTests
    {
        private PharmacyGoDbContext context;
        private List<Reservation> reservationsSaved;
        private ReservationRepository _reservationRepository;
        private Reservation newReservation;
        private Pharmacy pharmacy;

        [TestInitialize]
        public void InitTest()
        {
            pharmacy = new Pharmacy()
            {
                Id = 1,
                Name = "pharmacy",
                Address = "address",
                Users = new List<User>()
            };

            newReservation = new Reservation()
            {
                PharmacyName = pharmacy.Name,
                Pharmacy = pharmacy,
                ReservationDrugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        DrugId = 1,
                        Drug = new Drug
                        {
                            Id = 1,
                            Name = "Aspirina"
                        },
                        Quantity = 2
                    }
                }
            };
        }

        [TestCleanup]
        public void CleanUp()
        {
            context.Database.EnsureDeleted();
        }

        private void CreateDataBase(string name)
        {
            reservationsSaved = CreateDummyReservations();
            var options = new DbContextOptionsBuilder<PharmacyGoDbContext>()
                .UseInMemoryDatabase(databaseName: name)
                .Options;
            context = new PharmacyGoDbContext(options);

            // Agregar farmacias y drogas relacionadas primero (si no existen)
            foreach (var reservation in reservationsSaved)
            {
                if (reservation.Pharmacy != null)
                    context.Set<Pharmacy>().Add(reservation.Pharmacy);

                foreach (var reservationDrug in reservation.ReservationDrugs)
                {
                    if (reservationDrug.Drug != null)
                        context.Set<Drug>().Add(reservationDrug.Drug);
                }
                context.Set<Reservation>().Add(reservation);
            }

            context.SaveChanges();
            _reservationRepository = new ReservationRepository(context);
        }

        [TestMethod]
        public void InsertReservationOk()
        {
            CreateDataBase("insertDrugTestDb");
            _reservationRepository.InsertOne(newReservation);
            _reservationRepository.Save();
            var retrievedReservation = _reservationRepository.GetOneByExpression(d => d.Id == newReservation.Id);
            Assert.AreEqual(retrievedReservation.Id, retrievedReservation.Id);
        }


        private List<Reservation> CreateDummyReservations()
        {
            var pharmacy = new Pharmacy
            {
                Id = 1,
                Name = "pharmacy",
                Address = "address",
                Users = new List<User>()
            };

            var reservations = new List<Reservation>();
            for (int i = 1; i <= 10; i++)
            {
                var drug = new Drug
                {
                    Id = i,
                    Code = $"drugCode{i}",
                    Name = $"drugName{i}",
                    Price = 100,
                    Prescription = false,
                    Deleted = false,
                    Stock = 0,
                    Symptom = "headache",
                    Quantity = i,
                    Presentation = new Presentation { Id = i, Name = "capsules", Deleted = false },
                    UnitMeasure = new UnitMeasure { Id = i, Name = "g", Deleted = false },
                    Pharmacy = pharmacy
                };

                var reservationDrug = new ReservationDrug
                {
                    DrugId = drug.Id,
                    Drug = drug,
                    Quantity = i
                };

                var reservation = new Reservation
                {
                    Id = i,
                    PharmacyName = pharmacy.Name,
                    Pharmacy = pharmacy,
                    ReservationDrugs = new List<ReservationDrug> { reservationDrug }
                };

                reservations.Add(reservation);
            }
            return reservations;
        }
    }
}
