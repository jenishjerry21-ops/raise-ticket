namespace SmartDesk.Api.Domain.Entities;

public class StatusHistory
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public TicketStatus PreviousStatus { get; set; }
    public TicketStatus NewStatus { get; set; }
    public string Remark { get; set; } = "";

    public int AdminUserId { get; set; }
    public AdminUser AdminUser { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
