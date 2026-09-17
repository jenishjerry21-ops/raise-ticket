using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;
using SmartDesk.Api.Infrastructure.Persistence;

namespace SmartDesk.Api.Infrastructure.Repository;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _db;

    public AdminRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminUser?> GetByEmailAsync(string email)
    {
        return await _db.AdminUsers.FirstOrDefaultAsync(x => x.Email == email);
    }
}
