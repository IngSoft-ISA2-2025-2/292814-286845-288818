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
                    Status = ReservationStatus.Pending,
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
                    Status = ReservationStatus.Confirmed,
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
            _context = new PharmacyGoDbContext(options);

            foreach (var reservation in reservationsSaved)
            {
                if (reservation.Pharmacy != null)
                    _context.Set<Pharmacy>().Add(reservation.Pharmacy);

                foreach (var reservationDrug in reservation.Drugs)
                {
                    if (reservationDrug.Drug != null)
                        _context.Set<Drug>().Add(reservationDrug.Drug);
                }
                _context.Set<Reservation>().Add(reservation);
            }

            _context.SaveChanges();
            _reservationRepository = new ReservationRepository(_context);
        }

        [TestMethod]
        public void InsertReservationOk()
        {
            CreateDataBase("insertDrugTestDb");
            
            // Crear una nueva reserva con referencias a entidades existentes
            var existingPharmacy = _context.Set<Pharmacy>().First();
            var existingDrug = _context.Set<Drug>().First();
            
            var testReservation = new Reservation()
            {
                PharmacyName = existingPharmacy.Name,
                Email = "nuevo@test.com",
                Secret = "nuevoSecret123",
                Status = ReservationStatus.Pending,
                Drugs = new List<ReservationDrug>
                {
                    new ReservationDrug
                    {
                        DrugId = existingDrug.Id,
                        Quantity = 3
                    }
                }
            };
            
            _reservationRepository.InsertOne(testReservation);
            _reservationRepository.Save();
            
            var retrievedReservation = _reservationRepository.GetOneByExpression(d => d.Email == "nuevo@test.com");
            Assert.IsNotNull(retrievedReservation);
            Assert.AreEqual("nuevo@test.com", retrievedReservation.Email);
            Assert.AreEqual(existingPharmacy.Name, retrievedReservation.PharmacyName);
            Assert.AreEqual(1, retrievedReservation.Drugs.Count);
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

        [TestMethod]
        public void GetOneByExpression_LoadsRelatedDrugsAndPharmacy()
        {
            // Arrange
            _context.Pharmacys.Add(_pharmacy);
            _context.Drugs.Add(_drug);
            _context.Reservations.AddRange(_reservations);
            _context.SaveChanges();

            // Act
            var result = _reservationRepository.GetOneByExpression(r => r.Email == "usuario@test.com" && r.Secret == "miSecret123");

            // Assert
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.Pharmacy, "La propiedad Pharmacy debe estar cargada");
            Assert.IsNotNull(result.Drugs, "La propiedad Drugs debe estar cargada");
            Assert.IsTrue(result.Drugs.Count > 0, "Debe haber al menos un ReservationDrug");
            
            var firstReservationDrug = result.Drugs.First();
            Assert.IsNotNull(firstReservationDrug.Drug, "La propiedad Drug dentro de ReservationDrug debe estar cargada");
            Assert.AreEqual("Aspirina", firstReservationDrug.Drug.Name);
            Assert.AreEqual("Farmashop", result.Pharmacy.Name);
        }
    }
}
