using SmartWorking.Application.DTOs.Auth;

namespace SmartWorking.Application.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}
