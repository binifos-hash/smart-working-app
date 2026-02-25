using SmartWorking.Application.DTOs.Users;

namespace SmartWorking.Application.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetEmployeesByManagerAsync(int managerId);
}
