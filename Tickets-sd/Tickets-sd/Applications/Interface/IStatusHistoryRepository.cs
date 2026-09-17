using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Applications.Interface;

public interface IStatusHistoryRepository
{
    IQueryable<StatusHistory> GetAll();
    Task<StatusHistory?> GetByIdAsync(int id);
    Task AddAsync(StatusHistory history);
    void Remove(StatusHistory history);
    Task SaveChangesAsync();
}
