using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAdminAsync(AppDbContext db)
    {
        if (await db.AdminUsers.AnyAsync())
            return;

        db.AdminUsers.Add(new AdminUser
        {
            Name = "SmartDesk Admin",
            Email = "admin@smartdesk.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
        });

        await db.SaveChangesAsync();
    }
}
