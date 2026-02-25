namespace SmartWorking.Application.DTOs.Requests;

public class UpdateRequestStatusDto
{
    public string Status { get; set; } = string.Empty; // "Approved" | "Rejected"
}
