using Microsoft.EntityFrameworkCore;
using SmartWorking.Domain.Entities;
using SmartWorking.Domain.Interfaces;
using SmartWorking.Infrastructure.Data;

namespace SmartWorking.Infrastructure.Repositories;

public class SmartWorkingRequestRepository : ISmartWorkingRequestRepository
{
    private readonly AppDbContext _context;

    public SmartWorkingRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SmartWorkingRequest?> GetByIdAsync(int id)
        => await _context.SmartWorkingRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);

    public async Task<SmartWorkingRequest?> GetByActionTokenAsync(string token)
        => await _context.SmartWorkingRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.ActionToken == token);

    public async Task<IEnumerable<SmartWorkingRequest>> GetByUserIdAsync(int userId)
        => await _context.SmartWorkingRequests
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Date)
            .ToListAsync();

    public async Task<IEnumerable<SmartWorkingRequest>> GetByManagerIdAsync(int managerId)
        => await _context.SmartWorkingRequests
            .Include(r => r.User)
            .Where(r => r.User.ManagerId == managerId)
            .OrderByDescending(r => r.Date)
            .ToListAsync();

    public async Task<IEnumerable<SmartWorkingRequest>> GetAllAsync()
        => await _context.SmartWorkingRequests
            .Include(r => r.User)
            .OrderByDescending(r => r.Date)
            .ToListAsync();

    public async Task<SmartWorkingRequest> CreateAsync(SmartWorkingRequest request)
    {
        _context.SmartWorkingRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task UpdateAsync(SmartWorkingRequest request)
    {
        _context.SmartWorkingRequests.Update(request);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(SmartWorkingRequest request)
    {
        _context.SmartWorkingRequests.Remove(request);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasActiveRequestForDateAsync(int userId, DateOnly date)
        => await _context.SmartWorkingRequests.AnyAsync(r =>
            r.UserId == userId &&
            r.Date == date &&
            r.Status != Domain.Enums.RequestStatus.Rejected);
}
