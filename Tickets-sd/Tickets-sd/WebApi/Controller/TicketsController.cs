using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartDesk.Api.Applications.DTOs;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;
using SmartDesk.Api.Features.Mapping;
using SmartDesk.Api.Infrastructure.Persistence;

namespace SmartDesk.Api.WebApi.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IAiService _aiService;
    private readonly AppDbContext _db;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(
        ITicketRepository ticketRepository,
        IAiService aiService,
        AppDbContext db,
        ILogger<TicketsController> logger)
    {
        _ticketRepository = ticketRepository;
        _aiService = aiService;
        _db = db;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket(CreateTicketDto model)
    {
        var ticket = new Ticket
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim().ToLowerInvariant(),
            Subject = model.Subject.Trim(),
            Description = model.Description.Trim(),
            Status = TicketStatus.Open,
            Category = TicketCategory.General,
            Priority = TicketPriority.Medium,
            AiSummary = "AI classification is not available."
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        ticket.ReferenceNumber = $"TKT-{ticket.Id:00000}";

        var aiResult = await _aiService.ClassifyTicketAsync(
            ticket.Subject,
            ticket.Description,
            HttpContext.RequestAborted);

        var category = TicketCategory.General;
        var priority = TicketPriority.Medium;
        var aiApplied = aiResult != null &&
            Enum.TryParse<TicketCategory>(aiResult.Category, true, out category) &&
            Enum.TryParse<TicketPriority>(aiResult.Priority, true, out priority) &&
            !string.IsNullOrWhiteSpace(aiResult.Summary);

        if (aiApplied)
        {
            ticket.Category = category;
            ticket.Priority = priority;
            ticket.AiSummary = aiResult.Summary.Trim();
        }
        else
        {
            ticket.Category = TicketCategory.General;
            ticket.Priority = TicketPriority.Medium;
            ticket.AiSummary = "AI classification failed. Default classification was applied.";
            _logger.LogWarning(
                "AI classification failed for ticket {ReferenceNumber}; using Category={Category}, Priority={Priority}",
                ticket.ReferenceNumber,
                ticket.Category,
                ticket.Priority);
        }

        ticket.UpdatedAt = DateTime.UtcNow;
        await _ticketRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, new
        {
            message = "Ticket created successfully.",
            referenceNumber = ticket.ReferenceNumber
        });
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetTickets(
        string? search,
        string? status,
        string? category,
        string? priority,
        string sort = "newest",
        int page = 1,
        int pageSize = 10)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _ticketRepository.GetTickets();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(x =>
                x.ReferenceNumber.Contains(search) ||
                x.Subject.Contains(search) ||
                x.Email.Contains(search));
        }

        if (Enum.TryParse<TicketStatus>(status, true, out var statusValue))
            query = query.Where(x => x.Status == statusValue);

        if (Enum.TryParse<TicketCategory>(category, true, out var categoryValue))
            query = query.Where(x => x.Category == categoryValue);

        if (Enum.TryParse<TicketPriority>(priority, true, out var priorityValue))
            query = query.Where(x => x.Priority == priorityValue);

        query = sort.Equals("oldest", StringComparison.OrdinalIgnoreCase)
            ? query.OrderBy(x => x.CreatedAt)
            : query.OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync();
        var tickets = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResultDto<TicketDto>
        {
            Items = tickets.Select(x => x.ToDto()).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTicket(int id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        return Ok(new TicketDetailsDto
        {
            Ticket = ticket.ToDto(),
            History = ticket.StatusHistory
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => x.ToDto())
                .ToList()
        });
    }

    [AllowAnonymous]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusDto model)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        var statusText = model.Status.Replace(" ", "", StringComparison.Ordinal);
        if (!Enum.TryParse<TicketStatus>(statusText, true, out var newStatus))
        {
            return UnprocessableEntity(new { message = "Invalid status." });
        }

       
        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(idClaim, out var adminId))
            {
                _db.StatusHistories.Add(new StatusHistory
                {
                    TicketId = ticket.Id,
                    PreviousStatus = ticket.Status,
                    NewStatus = newStatus,
                    Remark = model.Remark.Trim(),
                    AdminUserId = adminId
                });
            }
        }

        ticket.Status = newStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.SaveChangesAsync();
        return Ok(ticket.ToDto());
    }

    [HttpPatch("{id:int}/classification")]
    public async Task<IActionResult> UpdateClassification(
        int id,
        UpdateClassificationDto model)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        if (!Enum.TryParse<TicketCategory>(model.Category, true, out var category))
            return UnprocessableEntity(new { message = "Invalid category." });

        if (!Enum.TryParse<TicketPriority>(model.Priority, true, out var priority))
            return UnprocessableEntity(new { message = "Invalid priority." });

        ticket.Category = category;
        ticket.Priority = priority;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.SaveChangesAsync();
        return Ok(ticket.ToDto());
    }

    [AllowAnonymous]
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var query = _ticketRepository.GetTickets();

        var byStatus = await query
            .GroupBy(x => x.Status)
            .Select(x => new { Name = x.Key.ToString(), Count = x.Count() })
            .ToDictionaryAsync(x => x.Name, x => x.Count);

        var byCategory = await query
            .GroupBy(x => x.Category)
            .Select(x => new { Name = x.Key.ToString(), Count = x.Count() })
            .ToDictionaryAsync(x => x.Name, x => x.Count);

        var byPriority = await query
            .GroupBy(x => x.Priority)
            .Select(x => new { Name = x.Key.ToString(), Count = x.Count() })
            .ToDictionaryAsync(x => x.Name, x => x.Count);

        var last7Days = DateTime.UtcNow.AddDays(-7);
        var recentCount = await query.CountAsync(x => x.CreatedAt >= last7Days);

        return Ok(new DashboardDto
        {
            ByStatus = byStatus,
            ByCategory = byCategory,
            ByPriority = byPriority,
            CreatedLast7Days = recentCount
        });
    }
}
