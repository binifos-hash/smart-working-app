using SmartWorking.Domain.Enums;

namespace SmartWorking.Domain.Entities;

public class SmartWorkingRequest
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateOnly Date { get; set; }
    public string? Description { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public string? ActionToken { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
