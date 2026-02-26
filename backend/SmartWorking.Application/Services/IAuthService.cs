using SmartWorking.Application.DTOs.Auth;

namespace SmartWorking.Application.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<(LoginResponseDto? Response, string? Error)> RegisterAsync(RegisterDto dto);
    Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
}
