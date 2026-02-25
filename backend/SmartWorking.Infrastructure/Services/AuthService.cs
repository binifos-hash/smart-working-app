using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartWorking.Application.DTOs.Auth;
using SmartWorking.Application.Services;
using SmartWorking.Domain.Entities;
using SmartWorking.Domain.Enums;
using SmartWorking.Domain.Interfaces;

namespace SmartWorking.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        var token = GenerateJwt(user.Id, user.Email, user.Role.ToString());

        return new LoginResponseDto
        {
            Token = token,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role.ToString(),
            UserId = user.Id
        };
    }

    public async Task<(LoginResponseDto? Response, string? Error)> RegisterAsync(RegisterDto dto)
    {
        var existing = await _userRepository.GetByEmailAsync(dto.Email);
        if (existing != null)
            return (null, "Esiste già un account con questa email.");

        var manager = await _userRepository.GetFirstManagerAsync();
        if (manager == null)
            return (null, "Nessun gestore trovato. Contatta l'amministratore.");

        var user = new User
        {
            Email = dto.Email.Trim().ToLower(),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Employee,
            ManagerId = manager.Id,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _userRepository.CreateAsync(user);
        var token = GenerateJwt(created.Id, created.Email, created.Role.ToString());

        return (new LoginResponseDto
        {
            Token = token,
            Email = created.Email,
            FirstName = created.FirstName,
            LastName = created.LastName,
            Role = created.Role.ToString(),
            UserId = created.Id
        }, null);
    }

    private string GenerateJwt(int userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
