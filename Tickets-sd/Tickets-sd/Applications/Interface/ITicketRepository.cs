using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Applications.Interface;

public interface ITicketRepository
{
    IQueryable<Ticket> GetTickets();
    Task<Ticket?> GetByIdAsync(int id);
    Task AddAsync(Ticket ticket);
    Task SaveChangesAsync();
}
