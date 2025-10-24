using System.Numerics;
using Microsoft.EntityFrameworkCore;
using PharmaGo.Domain.Entities;

namespace PharmaGo.DataAccess
{
    public class PharmacyGoDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Drug> Drugs { get; set; }
        public DbSet<Invitation> Invitations { get; set; }
        public DbSet<Pharmacy> Pharmacys { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<PurchaseDetail> PurchaseDetails { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StockRequest> StockRequests { get; set; }
        public DbSet<StockRequestDetail> StockRequestDetails { get; set; }
        public DbSet<UnitMeasure> UnitMeasures { get; set; }
        public DbSet<Presentation> Presentations { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationDrug> ReservationDrugs { get; set; }

        public PharmacyGoDbContext(DbContextOptions<PharmacyGoDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Drug>().Property(property => property.Price).HasPrecision(14, 2);
            modelBuilder.Entity<Purchase>().Property(property => property.TotalAmount).HasPrecision(14, 2);
            modelBuilder.Entity<PurchaseDetail>().Property(property => property.Price).HasPrecision(14, 2);

            modelBuilder.Entity<UnitMeasure>().Property(u => u.Name).HasConversion<string>();
            modelBuilder.Entity<Presentation>().Property(u => u.Name).HasConversion<string>();

            // Configuración explícita para el campo Password - soporta hashes BCrypt completos
            modelBuilder.Entity<User>()
                .Property(u => u.Password)
                .HasMaxLength(100);

            modelBuilder.Entity<ReservationDrug>()
                .HasKey(rd => new { rd.ReservationId, rd.DrugId });

            base.OnModelCreating(modelBuilder);

        }

    }
}
