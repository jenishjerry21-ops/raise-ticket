using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Applications.DTOs;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;
using System.Security.Claims;
using SmartDesk.Api.Features.Mapping;
using SmartDesk.Api.Infrastructure.Persistence;

namespace SmartDesk.Api.WebApi.Controllers;

using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/status-histories")]
[AllowAnonymous]
public class StatusHistoriesController : ControllerBase
{
    private readonly IStatusHistoryRepository _repo;
    private readonly AppDbContext _db;

    public StatusHistoriesController(IStatusHistoryRepository repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, int? ticketId = null, int? adminUserId = null, string? status = null, string sort = "newest")
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _repo.GetAll();

        if (ticketId.HasValue)
            query = query.Where(x => x.TicketId == ticketId.Value);

        if (adminUserId.HasValue)
            query = query.Where(x => x.AdminUserId == adminUserId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TicketStatus>(status, true, out var statusVal))
            query = query.Where(x => x.NewStatus == statusVal || x.PreviousStatus == statusVal);

        query = sort.Equals("oldest", StringComparison.OrdinalIgnoreCase)
            ? query.OrderBy(x => x.CreatedAt)
            : query.OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.AdminUser)
            .Include(x => x.Ticket)
            .ToListAsync();

        return Ok(new PagedResultDto<StatusHistoryDto>
        {
            Items = items.Select(x => x.ToDto()).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null)
            return NotFound(new { message = "Status history not found." });

        return Ok(item.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateStatusHistoryDto model)
    {
        if (!Enum.TryParse<TicketStatus>(model.PreviousStatus, true, out var prev))
            return UnprocessableEntity(new { message = "Invalid previous status." });

        if (!Enum.TryParse<TicketStatus>(model.NewStatus, true, out var next))
            return UnprocessableEntity(new { message = "Invalid new status." });

        int adminId;
        if (model.AdminUserId is > 0)
        {
            var exists = await _db.AdminUsers.AnyAsync(x => x.Id == model.AdminUserId.Value);
            if (!exists)
                return UnprocessableEntity(new { message = "AdminUserId is invalid." });

            adminId = model.AdminUserId.Value;
        }
        else
        {
            var idClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(idClaim, out adminId) || !await _db.AdminUsers.AnyAsync(x => x.Id == adminId))
            {
                var defaultAdmin = await _db.AdminUsers
                    .OrderBy(x => x.Id)
                    .Select(x => (int?)x.Id)
                    .FirstOrDefaultAsync();

                if (!defaultAdmin.HasValue)
                    return UnprocessableEntity(new { message = "No admin user is available for this status history." });

                adminId = defaultAdmin.Value;
            }
        }

        var history = new StatusHistory
        {
            TicketId = model.TicketId,
            PreviousStatus = prev,
            NewStatus = next,
            Remark = model.Remark?.Trim() ?? "",
            AdminUserId = adminId
        };

        await _repo.AddAsync(history);
        await _repo.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = history.Id }, history.ToDto());
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateStatusHistoryDto model)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null)
            return NotFound(new { message = "Status history not found." });

        if (!Enum.TryParse<TicketStatus>(model.PreviousStatus, true, out var prev))
            return UnprocessableEntity(new { message = "Invalid previous status." });

        if (!Enum.TryParse<TicketStatus>(model.NewStatus, true, out var next))
            return UnprocessableEntity(new { message = "Invalid new status." });

        item.PreviousStatus = prev;
        item.NewStatus = next;
        item.Remark = model.Remark?.Trim() ?? item.Remark;

        await _repo.SaveChangesAsync();

        return Ok(item.ToDto());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item == null)
            return NotFound(new { message = "Status history not found." });

        _repo.Remove(item);
        await _repo.SaveChangesAsync();

        return NoContent();
    }
}
