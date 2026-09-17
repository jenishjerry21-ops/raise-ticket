namespace SmartDesk.Api.Domain.Entities;

public class AdminUser
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";

    public List<StatusHistory> StatusHistory { get; set; } = new();
}
