using System.ComponentModel.DataAnnotations;

namespace SmartDesk.Api.Applications.DTOs;

public class CreateTicketDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = "";

    [Required, MaxLength(200)]
    public string Subject { get; set; } = "";

    [Required]
    public string Description { get; set; } = "";
}

public class UpdateStatusDto
{
    [Required]
    public string Status { get; set; } = "";

    [Required, MaxLength(1000)]
    public string Remark { get; set; } = "";
}

public class UpdateClassificationDto
{
    [Required]
    public string Category { get; set; } = "";

    [Required]
    public string Priority { get; set; } = "";
}

public class TicketDto
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "";
    public string Category { get; set; } = "";
    public string Priority { get; set; } = "";
    public string AiCategory { get; set; } = "";
    public string AiPriority { get; set; } = "";
    public string AiSummary { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class StatusHistoryDto
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string PreviousStatus { get; set; } = "";
    public string NewStatus { get; set; } = "";
    public string Remark { get; set; } = "";
    public int AdminUserId { get; set; }
    public string AdminName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class CreateStatusHistoryDto
{
    public int TicketId { get; set; }
    public string PreviousStatus { get; set; } = "";
    public string NewStatus { get; set; } = "";
    public string Remark { get; set; } = "";
    public int? AdminUserId { get; set; }
}

public class UpdateStatusHistoryDto
{
    public string PreviousStatus { get; set; } = "";
    public string NewStatus { get; set; } = "";
    public string Remark { get; set; } = "";
}

public class TicketDetailsDto
{
    public TicketDto Ticket { get; set; } = new();
    public List<StatusHistoryDto> History { get; set; } = new();
}

public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
