using SmartWorking.Application.DTOs.Requests;

namespace SmartWorking.Application.Services;

public interface IRequestService
{
    Task<IEnumerable<RequestDto>> GetMyRequestsAsync(int userId);
    Task<IEnumerable<RequestDto>> GetAllRequestsAsync();
    Task<IEnumerable<RequestDto>> GetRequestsByManagerAsync(int managerId);
    Task<RequestDto> CreateRequestAsync(int userId, CreateRequestDto dto);
    Task<RequestDto> UpdateRequestStatusAsync(int requestId, string status, int managerId);
    Task<bool> HandleEmailActionAsync(string token, string action);
}
