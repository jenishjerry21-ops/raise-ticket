namespace SmartDesk.Api.Domain.Entities;

public enum TicketStatus { Open, InProgress, Resolved, Closed }
public enum TicketCategory { Technical, Billing, Account, General }
public enum TicketPriority { Low, Medium, High }

public class Ticket
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = "";

    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";

    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketCategory Category { get; set; } = TicketCategory.General;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;

    public string AiSummary { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<StatusHistory> StatusHistory { get; set; } = new();
}
