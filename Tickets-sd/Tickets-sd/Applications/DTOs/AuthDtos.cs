using System.ComponentModel.DataAnnotations;

namespace SmartDesk.Api.Applications.DTOs;

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public class LoginResponseDto
{
    public string Token { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}
