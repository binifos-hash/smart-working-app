namespace SmartWorking.Application.DTOs.Requests;

public class CreateRequestDto
{
    public DateOnly Date { get; set; }
    public string? Description { get; set; }
}
