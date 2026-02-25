using Microsoft.EntityFrameworkCore;
using SmartWorking.Domain.Entities;
using SmartWorking.Domain.Enums;
using SmartWorking.Domain.Interfaces;
using SmartWorking.Infrastructure.Data;

namespace SmartWorking.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
        => await _context.Users.Include(u => u.Manager).FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email)
        => await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<IEnumerable<User>> GetEmployeesByManagerIdAsync(int managerId)
        => await _context.Users.Where(u => u.ManagerId == managerId).ToListAsync();

    public async Task<User?> GetFirstManagerAsync()
        => await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Manager);

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}
