using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;
using SmartDesk.Api.Infrastructure.Persistence;

namespace SmartDesk.Api.Infrastructure.Repository;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _db;

    public TicketRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Ticket> GetTickets()
    {
        return _db.Tickets.AsNoTracking();
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _db.Tickets
            .Include(x => x.StatusHistory)
            .ThenInclude(x => x.AdminUser)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _db.Tickets.AddAsync(ticket);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
