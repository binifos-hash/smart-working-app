using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using SmartWorking.Domain.Interfaces;

namespace SmartWorking.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly string _senderEmail;
    private readonly string _senderPassword;
    private readonly string _frontendUrl;

    public EmailService(IConfiguration config)
    {
        _config = config;
        _senderEmail = _config["Email:SenderEmail"] ?? "bini.fos@gmail.com";
        _senderPassword = _config["Email:SenderPassword"] ?? "";
        _frontendUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task SendRequestCreatedEmailAsync(
        string toEmail, string employeeName, DateOnly date,
        string? description, int requestId, string actionToken)
    {
        var approveUrl = $"{_frontendUrl}/action?token={actionToken}&action=approve";
        var rejectUrl = $"{_frontendUrl}/action?token={actionToken}&action=reject";

        var body = $"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #2563eb;">Nuova Richiesta Smart Working</h2>
              <p><strong>{employeeName}</strong> ha richiesto uno smart working.</p>
              <table style="width:100%; border-collapse:collapse; margin:20px 0;">
                <tr>
                  <td style="padding:8px; background:#f3f4f6; font-weight:bold;">Data</td>
                  <td style="padding:8px;">{date:dd/MM/yyyy}</td>
                </tr>
                {(string.IsNullOrEmpty(description) ? "" : $"""
                <tr>
                  <td style="padding:8px; background:#f3f4f6; font-weight:bold;">Note</td>
                  <td style="padding:8px;">{description}</td>
                </tr>
                """)}
              </table>
              <p>Approva o rifiuta la richiesta cliccando uno dei pulsanti:</p>
              <div style="margin: 30px 0;">
                <a href="{approveUrl}"
                   style="background:#16a34a; color:white; padding:12px 28px; border-radius:6px;
                          text-decoration:none; font-weight:bold; margin-right:16px;">
                  ✅ Approva
                </a>
                <a href="{rejectUrl}"
                   style="background:#dc2626; color:white; padding:12px 28px; border-radius:6px;
                          text-decoration:none; font-weight:bold;">
                  ❌ Rifiuta
                </a>
              </div>
              <p style="color:#6b7280; font-size:12px;">
                Puoi anche gestire la richiesta direttamente dal pannello di amministrazione.
              </p>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, $"Richiesta Smart Working – {employeeName} – {date:dd/MM/yyyy}", body);
    }

    public async Task SendRequestStatusEmailAsync(
        string toEmail, string employeeName, DateOnly date, string status)
    {
        var isApproved = status == "Approved";
        var statusText = isApproved ? "APPROVATA ✅" : "RIFIUTATA ❌";
        var color = isApproved ? "#16a34a" : "#dc2626";

        var body = $"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: {color};">Richiesta Smart Working {statusText}</h2>
              <p>Ciao <strong>{employeeName}</strong>,</p>
              <p>La tua richiesta di smart working per il giorno <strong>{date:dd/MM/yyyy}</strong>
                 è stata <strong style="color:{color};">{(isApproved ? "approvata" : "rifiutata")}</strong>.</p>
              <p style="color:#6b7280; font-size:12px;">
                Accedi all'applicazione per visualizzare tutti i dettagli.
              </p>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, $"Smart Working {date:dd/MM/yyyy} – {statusText}", body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Smart Working App", _senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_senderEmail, _senderPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
