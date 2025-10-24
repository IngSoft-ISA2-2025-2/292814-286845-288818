using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PharmaGo.DataAccess;
using PharmaGo.DataAccess.Repositories;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

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

        [TestInitialize]
        public void TestInitialize()
        {
            var contextOptions = new DbContextOptionsBuilder<PharmacyGoContext>()
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
        }

        [TestCleanup]
        public void TestCleanup()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [TestMethod]
        public void GetReservationsByUser_Ok()
        {
            // Arrange
            _context.Pharmacies.Add(_pharmacy);
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