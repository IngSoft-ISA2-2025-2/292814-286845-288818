using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PharmaGo.DataAccess;
using PharmaGo.IDataAccess;
using PharmaGo.DataAccess.Repositories;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace PharmaGo.Test.DataAccess.Test
{
    [TestClass]
    public class ReservationRepositoryTests
    {
        private PharmacyGoDbContext _context;
        private ReservationRepository _reservationRepository;
        private Pharmacy _pharmacy;
        private Drug _drug;
        private List<Reservation> _reservations;
        private Reservation newReservation;
        private Pharmacy pharmacy;

        [TestInitialize]
        public void TestInitialize()
        {
            var contextOptions = new DbContextOptionsBuilder<PharmacyGoDbContext>()
                .UseInMemoryDatabase("ReservationTestDatabase")
                .Options;

            _context = new PharmacyGoDbContext(contextOptions);
            _reservationRepository = new ReservationRepository(_context);

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
                    Status = ReservationStatus.Pendiente,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 2
                        }
                    }
                },
                new Reservation
                {
                    Id = 2,
                    PharmacyName = "Farmacia Central", 
                    Pharmacy = _pharmacy,
                    Email = "usuario@test.com",
                    Secret = "miSecret123",
                    Status = ReservationStatus.Confirmada,
                    Drugs = new List<ReservationDrug>
                    {
                        new ReservationDrug
                        {
                            DrugId = 1,
                            Drug = _drug,
                            Quantity = 1
                        }
                    }
                }
            };

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
                Drugs = new List<ReservationDrug>
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
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

    
        private void CreateDataBase(string name)
        {
            var reservationsSaved = CreateDummyReservations();
            var options = new DbContextOptionsBuilder<PharmacyGoDbContext>()
                .UseInMemoryDatabase(databaseName: name)
                .Options;
            var context = new PharmacyGoDbContext(options);

            foreach (var reservation in reservationsSaved)
            {
                if (reservation.Pharmacy != null)
                    context.Set<Pharmacy>().Add(reservation.Pharmacy);

                foreach (var reservationDrug in reservation.Drugs)
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
                    Drugs = new List<ReservationDrug> { reservationDrug }
                };

                reservations.Add(reservation);
            }
            return reservations;
        }

        [TestMethod]
        public void GetReservationsByUser_Ok()
        {
            // Arrange
            _context.Pharmacys.Add(_pharmacy);
            _context.Drugs.Add(_drug);
            _context.Reservations.AddRange(_reservations);
            _context.SaveChanges();

            string email = "usuario@test.com";
            string secret = "miSecret123";

            // Act
            var result = _reservationRepository.GetAllByExpression(r => r.Email == email && r.Secret == secret);

            // Assert
            Assert.IsNotNull(result);
            var resultList = result.ToList();
            Assert.AreEqual(2, resultList.Count);
            
            Assert.AreEqual(_reservations[0].Id, resultList[0].Id);
            Assert.AreEqual(_reservations[0].PharmacyName, resultList[0].PharmacyName);
            Assert.AreEqual(_reservations[0].Status, resultList[0].Status);
            Assert.AreEqual(_reservations[0].Email, resultList[0].Email);
            
            Assert.AreEqual(_reservations[1].Id, resultList[1].Id);
            Assert.AreEqual(_reservations[1].PharmacyName, resultList[1].PharmacyName);
            Assert.AreEqual(_reservations[1].Status, resultList[1].Status);
            Assert.AreEqual(_reservations[1].Email, resultList[1].Email);
        }
    }
}
