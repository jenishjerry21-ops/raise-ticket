using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.ReferenceNumber).IsUnique();
            entity.Property(x => x.Status).HasConversion<string>();
            entity.Property(x => x.Category).HasConversion<string>();
            entity.Property(x => x.Priority).HasConversion<string>();
        });

        modelBuilder.Entity<StatusHistory>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.PreviousStatus).HasConversion<string>();
            entity.Property(x => x.NewStatus).HasConversion<string>();

            entity.HasOne(x => x.Ticket)
                .WithMany(x => x.StatusHistory)
                .HasForeignKey(x => x.TicketId);

            entity.HasOne(x => x.AdminUser)
                .WithMany(x => x.StatusHistory)
                .HasForeignKey(x => x.AdminUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
        });
    }
}
