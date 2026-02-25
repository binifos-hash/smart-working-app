namespace SmartWorking.Application.DTOs.Requests;

public class RequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeEmail { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
