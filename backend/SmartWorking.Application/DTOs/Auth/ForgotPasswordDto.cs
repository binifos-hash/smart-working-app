using System.ComponentModel.DataAnnotations;

namespace SmartWorking.Application.DTOs.Auth;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
