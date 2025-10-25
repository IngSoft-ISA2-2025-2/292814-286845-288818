using System;
using System.Collections.Generic;
using System.Linq;
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
        public override void InsertOne(Reservation reservation)
        {
            _context.Entry(reservation).State = EntityState.Added;
            _context.Set<Reservation>().Add(reservation);
        }
    }
}
