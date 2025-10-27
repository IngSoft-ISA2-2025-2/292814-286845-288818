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
            _context.Entry(reservation).State = EntityState.Added;
            _context.Set<Reservation>().Add(reservation);
        }
    }
}
