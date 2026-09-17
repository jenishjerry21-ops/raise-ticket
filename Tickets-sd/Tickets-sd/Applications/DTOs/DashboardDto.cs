namespace SmartDesk.Api.Applications.DTOs;

public class DashboardDto
{
    public Dictionary<string, int> ByStatus { get; set; } = new();
    public Dictionary<string, int> ByCategory { get; set; } = new();
    public Dictionary<string, int> ByPriority { get; set; } = new();
    public int CreatedLast7Days { get; set; }
}
