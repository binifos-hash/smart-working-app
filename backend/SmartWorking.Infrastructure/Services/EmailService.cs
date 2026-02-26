using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartWorking.Domain.Interfaces;

namespace SmartWorking.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _frontendUrl;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _apiKey      = config["MailerSend:ApiKey"] ?? "";
        _senderEmail = config["Email:SenderEmail"] ?? "bini.fos@gmail.com";
        _senderName  = config["Email:SenderName"] ?? "Smart Working App";
        _frontendUrl = config["Frontend:BaseUrl"] ?? "http://localhost:5173";
        _logger      = logger;
    }

    public async Task SendRequestCreatedEmailAsync(
        string toEmail, string employeeName, DateOnly date,
        string? description, int requestId, string actionToken)
    {
        var approveUrl = $"{_frontendUrl}/action?token={actionToken}&action=approve";
        var rejectUrl  = $"{_frontendUrl}/action?token={actionToken}&action=reject";

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
                  Approva
                </a>
                <a href="{rejectUrl}"
                   style="background:#dc2626; color:white; padding:12px 28px; border-radius:6px;
                          text-decoration:none; font-weight:bold;">
                  Rifiuta
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
        var statusText = isApproved ? "APPROVATA" : "RIFIUTATA";
        var color      = isApproved ? "#16a34a" : "#dc2626";

        var body = $"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: {color};">Richiesta Smart Working {statusText}</h2>
              <p>Ciao <strong>{employeeName}</strong>,</p>
              <p>La tua richiesta di smart working per il giorno <strong>{date:dd/MM/yyyy}</strong>
                 e stata <strong style="color:{color};">{(isApproved ? "approvata" : "rifiutata")}</strong>.</p>
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
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("MailerSend API key not configured – email not sent");
            return;
        }

        using var http = new HttpClient();
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var payload = JsonSerializer.Serialize(new
        {
            from    = new { name = _senderName, email = _senderEmail },
            to      = new[] { new { email = toEmail } },
            subject = subject,
            html    = htmlBody
        });

        var content  = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await http.PostAsync("https://api.mailersend.com/v1/email", content);

        if (!response.IsSuccessStatusCode)
        {
            var respBody = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"MailerSend error {(int)response.StatusCode}: {respBody}");
        }
    }
}
