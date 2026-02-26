using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWorking.Application.DTOs.Requests;
using SmartWorking.Application.Services;

namespace SmartWorking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestsController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role)!;

    /// <summary>Employee: get own requests. Manager: get all requests under them.</summary>
    [HttpGet]
    public async Task<IActionResult> GetRequests()
    {
        if (CurrentUserRole == "Manager")
        {
            var all = await _requestService.GetRequestsByManagerAsync(CurrentUserId);
            return Ok(all);
        }

        var mine = await _requestService.GetMyRequestsAsync(CurrentUserId);
        return Ok(mine);
    }

    /// <summary>Manager only: get ALL requests in the system.</summary>
    [HttpGet("all")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _requestService.GetAllRequestsAsync();
        return Ok(requests);
    }

    /// <summary>Employee: create a new smart working request.</summary>
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _requestService.CreateRequestAsync(CurrentUserId, dto);
            return CreatedAtAction(nameof(GetRequests), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Manager: approve or reject a specific request.</summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
    {
        if (dto.Status != "Approved" && dto.Status != "Rejected")
            return BadRequest(new { message = "Stato non valido. Usa 'Approved' o 'Rejected'." });

        try
        {
            var result = await _requestService.UpdateRequestStatusAsync(id, dto.Status, CurrentUserId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Manager: delete an approved or rejected request.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        try
        {
            await _requestService.DeleteRequestAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Public: handle approve/reject from email link (token-based).</summary>
    [HttpGet("action")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleEmailAction([FromQuery] string token, [FromQuery] string action)
    {
        if (string.IsNullOrEmpty(token) || (action != "approve" && action != "reject"))
            return BadRequest(new { message = "Parametri non validi." });

        var success = await _requestService.HandleEmailActionAsync(token, action);
        if (!success)
            return BadRequest(new { message = "Token non valido, scaduto o richiesta già elaborata." });

        var actionText = action == "approve" ? "approvata" : "rifiutata";
        return Ok(new { message = $"Richiesta {actionText} con successo." });
    }
}
