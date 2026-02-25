namespace SmartWorking.Domain.Interfaces;

public interface IEmailService
{
    Task SendRequestCreatedEmailAsync(string toEmail, string employeeName, DateOnly date, string? description, int requestId, string actionToken);
    Task SendRequestStatusEmailAsync(string toEmail, string employeeName, DateOnly date, string status);
}
