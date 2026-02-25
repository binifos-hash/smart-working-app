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

    public RequestService(
        ISmartWorkingRequestRepository requestRepository,
        IUserRepository userRepository,
        IEmailService emailService)
    {
        _requestRepository = requestRepository;
        _userRepository = userRepository;
        _emailService = emailService;
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

        // Send email to manager
        await _emailService.SendRequestCreatedEmailAsync(
            manager.Email,
            $"{user.FirstName} {user.LastName}",
            dto.Date,
            dto.Description,
            created.Id,
            actionToken
        );

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

        // Notify the employee
        await _emailService.SendRequestStatusEmailAsync(
            request.User.Email,
            $"{request.User.FirstName} {request.User.LastName}",
            request.Date,
            request.Status.ToString()
        );

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

        await _emailService.SendRequestStatusEmailAsync(
            request.User.Email,
            $"{request.User.FirstName} {request.User.LastName}",
            request.Date,
            request.Status.ToString()
        );

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
