using Microsoft.EntityFrameworkCore;
using SmartWorking.Domain.Entities;
using SmartWorking.Domain.Enums;

namespace SmartWorking.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<SmartWorkingRequest> SmartWorkingRequests => Set<SmartWorkingRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Role).HasConversion<int>();

            entity.HasOne(u => u.Manager)
                .WithMany(u => u.Employees)
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SmartWorkingRequest>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Status).HasConversion<int>();
            entity.Property(r => r.Description).HasMaxLength(500);
            entity.Property(r => r.ActionToken).HasMaxLength(512);

            entity.HasOne(r => r.User)
                .WithMany(u => u.Requests)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed admin user — password: Admin@123
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Email = "admin@smartworking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Admin",
            LastName = "Manager",
            Role = UserRole.Manager,
            ManagerId = null,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
