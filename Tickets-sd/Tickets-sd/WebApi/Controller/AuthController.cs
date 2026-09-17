using Microsoft.AspNetCore.Mvc;
using SmartDesk.Api.Applications.DTOs;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Infrastructure.Services;

namespace SmartDesk.Api.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAdminRepository _adminRepository;
    private readonly TokenService _tokenService;

    public AuthController(IAdminRepository adminRepository, TokenService tokenService)
    {
        _adminRepository = adminRepository;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        var email = model.Email.Trim().ToLowerInvariant();
        var admin = await _adminRepository.GetByEmailAsync(email);

        if (admin == null || !BCrypt.Net.BCrypt.Verify(model.Password, admin.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new LoginResponseDto
        {
            Token = _tokenService.CreateToken(admin),
            Name = admin.Name,
            Email = admin.Email
        });
    }
}
