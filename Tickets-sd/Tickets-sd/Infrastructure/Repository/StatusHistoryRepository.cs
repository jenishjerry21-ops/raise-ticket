using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;
using SmartDesk.Api.Infrastructure.Persistence;

namespace SmartDesk.Api.Infrastructure.Repository;

public class StatusHistoryRepository : IStatusHistoryRepository
{
    private readonly AppDbContext _db;

    public StatusHistoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<StatusHistory> GetAll()
    {
        return _db.StatusHistories.AsNoTracking();
    }

    public async Task<StatusHistory?> GetByIdAsync(int id)
    {
        return await _db.StatusHistories
            .Include(x => x.AdminUser)
            .Include(x => x.Ticket)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(StatusHistory history)
    {
        await _db.StatusHistories.AddAsync(history);
    }

    public void Remove(StatusHistory history)
    {
        _db.StatusHistories.Remove(history);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
