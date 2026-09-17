using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Applications.Interface;

public interface IAdminRepository
{
    Task<AdminUser?> GetByEmailAsync(string email);
}
