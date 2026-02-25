using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWorking.Application.Services;

namespace SmartWorking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        var employees = await _userService.GetEmployeesByManagerAsync(CurrentUserId);
        return Ok(employees);
    }
}
