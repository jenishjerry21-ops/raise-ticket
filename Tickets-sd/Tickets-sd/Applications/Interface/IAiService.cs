namespace SmartDesk.Api.Applications.Interface;

public class AiResult
{
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "Medium";
    public string Summary { get; set; } = "";
}

public interface IAiService
{
    Task<AiResult?> ClassifyTicketAsync(string subject, string description);
}
