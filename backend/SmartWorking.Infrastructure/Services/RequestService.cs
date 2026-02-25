using Microsoft.Extensions.Logging;
using SmartWorking.Application.DTOs.Requests;
using SmartWorking.Application.Services;
using SmartWorking.Domain.Entities;
using SmartWorking.Domain.Enums;
using SmartWorking.Domain.Interfaces;

namespace SmartWorking.Infrastructure.Services;

public class RequestService : IRequestService
{
    private readonly ISmartWorkingRequestRepository _requestRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<RequestService> _logger;

    public RequestService(
        ISmartWorkingRequestRepository requestRepository,
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<RequestService> logger)
    {
        _requestRepository = requestRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<IEnumerable<RequestDto>> GetMyRequestsAsync(int userId)
    {
        var requests = await _requestRepository.GetByUserIdAsync(userId);
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<RequestDto>> GetAllRequestsAsync()
    {
        var requests = await _requestRepository.GetAllAsync();
        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<RequestDto>> GetRequestsByManagerAsync(int managerId)
    {
        var requests = await _requestRepository.GetByManagerIdAsync(managerId);
        return requests.Select(MapToDto);
    }

    public async Task<RequestDto> CreateRequestAsync(int userId, CreateRequestDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (user.ManagerId == null)
            throw new InvalidOperationException("No manager assigned to this user.");

        var manager = await _userRepository.GetByIdAsync(user.ManagerId.Value)
            ?? throw new InvalidOperationException("Manager not found.");

        var actionToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

        var request = new SmartWorkingRequest
        {
            UserId = userId,
            Date = dto.Date,
            Description = dto.Description,
            Status = RequestStatus.Pending,
            ActionToken = actionToken,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _requestRepository.CreateAsync(request);

        // Fire and forget — email must never slow down the response
        var managerEmail = manager.Email;
        var employeeName = $"{user.FirstName} {user.LastName}";
        var createdId = created.Id;
        var date = dto.Date;
        var description = dto.Description;
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendRequestCreatedEmailAsync(
                    managerEmail, employeeName, date, description, createdId, actionToken);
                _logger.LogInformation("Request-created email sent to {Email}", managerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send request-created email to {Email}", managerEmail);
            }
        });

        return MapToDto(created);
    }

    public async Task<RequestDto> UpdateRequestStatusAsync(int requestId, string status, int managerId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId)
            ?? throw new InvalidOperationException("Request not found.");

        if (request.User.ManagerId != managerId)
            throw new UnauthorizedAccessException("You are not the manager of this employee.");

        request.Status = status == "Approved" ? RequestStatus.Approved : RequestStatus.Rejected;
        request.ActionToken = null;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);

        // Fire and forget — notify employee without blocking the response
        var empEmail = request.User.Email;
        var empName = $"{request.User.FirstName} {request.User.LastName}";
        var reqDate = request.Date;
        var reqStatus = request.Status.ToString();
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendRequestStatusEmailAsync(empEmail, empName, reqDate, reqStatus);
                _logger.LogInformation("Status email sent to {Email}", empEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send status email to {Email}", empEmail);
            }
        });

        return MapToDto(request);
    }

    public async Task<bool> HandleEmailActionAsync(string token, string action)
    {
        var request = await _requestRepository.GetByActionTokenAsync(token);
        if (request == null || request.Status != RequestStatus.Pending)
            return false;

        request.Status = action == "approve" ? RequestStatus.Approved : RequestStatus.Rejected;
        request.ActionToken = null;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepository.UpdateAsync(request);

        var empEmail = request.User.Email;
        var empName = $"{request.User.FirstName} {request.User.LastName}";
        var reqDate = request.Date;
        var reqStatus = request.Status.ToString();
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendRequestStatusEmailAsync(empEmail, empName, reqDate, reqStatus);
                _logger.LogInformation("Status email sent to {Email}", empEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send status email to {Email}", empEmail);
            }
        });

        return true;
    }

    private static RequestDto MapToDto(SmartWorkingRequest r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        EmployeeName = $"{r.User.FirstName} {r.User.LastName}",
        EmployeeEmail = r.User.Email,
        Date = r.Date,
        Description = r.Description,
        Status = r.Status.ToString(),
        CreatedAt = r.CreatedAt
    };
}
