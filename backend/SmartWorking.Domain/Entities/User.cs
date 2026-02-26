using SmartWorking.Domain.Enums;

namespace SmartWorking.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public int? ManagerId { get; set; }
    public User? Manager { get; set; }
    public ICollection<User> Employees { get; set; } = new List<User>();
    public ICollection<SmartWorkingRequest> Requests { get; set; } = new List<SmartWorkingRequest>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool MustChangePassword { get; set; } = false;
}
