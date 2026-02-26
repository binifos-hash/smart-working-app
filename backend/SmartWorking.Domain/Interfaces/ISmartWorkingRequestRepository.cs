using SmartWorking.Domain.Entities;

namespace SmartWorking.Domain.Interfaces;

public interface ISmartWorkingRequestRepository
{
    Task<SmartWorkingRequest?> GetByIdAsync(int id);
    Task<SmartWorkingRequest?> GetByActionTokenAsync(string token);
    Task<IEnumerable<SmartWorkingRequest>> GetByUserIdAsync(int userId);
    Task<IEnumerable<SmartWorkingRequest>> GetByManagerIdAsync(int managerId);
    Task<IEnumerable<SmartWorkingRequest>> GetAllAsync();
    Task<SmartWorkingRequest> CreateAsync(SmartWorkingRequest request);
    Task UpdateAsync(SmartWorkingRequest request);
    Task<bool> HasActiveRequestForDateAsync(int userId, DateOnly date);
}
