using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepository, IConfiguration config, IEmailService emailService, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _config = config;
        _emailService = emailService;
        _logger = logger;
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

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.Trim().ToLower());
        if (user == null)
            return false;

        var tempPassword = GenerateTempPassword();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
        await _userRepository.UpdateAsync(user);

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendTempPasswordEmailAsync(user.Email, user.FirstName, tempPassword);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send temp password email to {Email}", user.Email);
            }
        });

        return true;
    }

    private static string GenerateTempPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 10).Select(_ => chars[random.Next(chars.Length)]).ToArray());
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
