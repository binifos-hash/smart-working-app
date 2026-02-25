using SmartWorking.Domain.Entities;

namespace SmartWorking.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetEmployeesByManagerIdAsync(int managerId);
    Task<User?> GetFirstManagerAsync();
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
}
