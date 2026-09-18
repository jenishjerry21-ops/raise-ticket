namespace SmartDesk.Api.Applications.DTOs;

public sealed class AiClassificationResponse
{
    public string Category { get; set; } = "General";
    public string Priority { get; set; } = "Medium";
    public string Summary { get; set; } = "";
}
