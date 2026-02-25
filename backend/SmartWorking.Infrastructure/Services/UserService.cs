using SmartWorking.Application.DTOs.Users;
using SmartWorking.Application.Services;
using SmartWorking.Domain.Interfaces;

namespace SmartWorking.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetEmployeesByManagerAsync(int managerId)
    {
        var employees = await _userRepository.GetEmployeesByManagerIdAsync(managerId);
        return employees.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Role = u.Role.ToString()
        });
    }
}
