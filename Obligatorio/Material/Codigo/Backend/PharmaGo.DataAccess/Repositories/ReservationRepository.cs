using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PharmaGo.Domain.Entities;

namespace PharmaGo.DataAccess.Repositories
{
    public class ReservationRepository : BaseRepository<Reservation>
    {
        private readonly PharmacyGoDbContext _context;

        public ReservationRepository(PharmacyGoDbContext context) : base(context)
        {
            _context = context;
        }

        public override IEnumerable<Reservation> GetAllByExpression(Expression<Func<Reservation, bool>> expression)
        {
            return _context.Set<Reservation>()
                .Include(r => r.Pharmacy)
                .Include(r => r.Drugs)
                    .ThenInclude(rd => rd.Drug)
                .Where(expression);
        }

        public override Reservation GetOneByExpression(Expression<Func<Reservation, bool>> expression)
        {
            return _context.Set<Reservation>()
                .Include(r => r.Pharmacy)
                .Include(r => r.Drugs)
                    .ThenInclude(rd => rd.Drug)
                .FirstOrDefault(expression);
        }

        public override void InsertOne(Reservation reservation)
        {
            // Asegurar que la Pharmacy existente no se marque como Added
            if (reservation.Pharmacy != null)
            {
                var pharmacyEntry = _context.Entry(reservation.Pharmacy);
                if (pharmacyEntry.State == EntityState.Detached)
                {
                    _context.Attach(reservation.Pharmacy);
                }
                pharmacyEntry.State = EntityState.Unchanged;
            }
            
            // Marcar cada ReservationDrug y sus Drugs existentes
            if (reservation.Drugs != null)
            {
                foreach (var reservationDrug in reservation.Drugs)
                {
                    // Asegurar que el Drug existente no se marque como Added
                    if (reservationDrug.Drug != null)
                    {
                        var drugEntry = _context.Entry(reservationDrug.Drug);
                        if (drugEntry.State == EntityState.Detached)
                        {
                            _context.Attach(reservationDrug.Drug);
                        }
                        drugEntry.State = EntityState.Unchanged;
                    }
                }
            }
            
            // Agregar la reserva (esto agregará automáticamente los ReservationDrugs)
            _context.Set<Reservation>().Add(reservation);
        }
    }
}
