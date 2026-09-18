using SmartDesk.Api.Applications.DTOs;
using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Features.Mapping;

public static class TicketMapping
{
    public static TicketDto ToDto(this Ticket ticket)
    {
        return new TicketDto
        {
            Id = ticket.Id,
            ReferenceNumber = ticket.ReferenceNumber,
            Name = ticket.Name,
            Email = ticket.Email,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Status = ticket.Status.ToString(),
            Category = ticket.Category.ToString(),
            Priority = ticket.Priority.ToString(),
            AiCategory = ticket.Category.ToString(),
            AiPriority = ticket.Priority.ToString(),
            AiSummary = ticket.AiSummary,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    public static StatusHistoryDto ToDto(this StatusHistory history)
    {
        return new StatusHistoryDto
        {
            Id = history.Id,
            TicketId = history.TicketId,
            PreviousStatus = history.PreviousStatus.ToString(),
            NewStatus = history.NewStatus.ToString(),
            Remark = history.Remark,
            AdminUserId = history.AdminUserId,
            AdminName = history.AdminUser?.Name ?? "Admin",
            CreatedAt = history.CreatedAt
        };
    }
}
