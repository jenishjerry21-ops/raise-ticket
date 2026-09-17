using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SmartDesk.Api.Applications.Interface;
using SmartDesk.Api.Domain.Entities;

namespace SmartDesk.Api.Infrastructure.Services;

public class AiService : IAiService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiService> _logger;

    public AiService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<AiService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<AiResult?> ClassifyTicketAsync(string subject, string description)
    {
        // AI is optional. If it is not configured, the ticket keeps the defaults.
        if (!_configuration.GetValue<bool>("AI:Enabled"))
            return null;

        var apiKey = _configuration["AI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return null;

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var body = new
            {
                model = _configuration["AI:Model"] ?? "gpt-4o-mini",
                temperature = 0,
                response_format = new { type = "json_object" },
                messages = new object[]
                {
                    new { role = "system", content = "Classify the support ticket. Return JSON with category (Technical, Billing, Account, General), priority (Low, Medium, High), and a short summary." },
                    new { role = "user", content = $"Subject: {subject}\nDescription: {description}" }
                }
            };

            var url = _configuration["AI:Endpoint"] ?? "https://api.openai.com/v1/chat/completions";
            var json = JsonSerializer.Serialize(body);
            var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI service returned {StatusCode}", response.StatusCode);
                return null;
            }

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var content = document.RootElement.GetProperty("choices")[0]
                .GetProperty("message").GetProperty("content").GetString();

            if (string.IsNullOrWhiteSpace(content)) return null;

            var result = JsonSerializer.Deserialize<AiResult>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result == null) return null;

            var validCategories = Enum.GetNames<TicketCategory>();
            var validPriorities = Enum.GetNames<TicketPriority>();

            if (!validCategories.Contains(result.Category, StringComparer.OrdinalIgnoreCase) ||
                !validPriorities.Contains(result.Priority, StringComparer.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(result.Summary))
                return null;

            result.Category = validCategories.First(x => x.Equals(result.Category, StringComparison.OrdinalIgnoreCase));
            result.Priority = validPriorities.First(x => x.Equals(result.Priority, StringComparison.OrdinalIgnoreCase));
            result.Summary = result.Summary.Trim();

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI classification failed");
            return null;
        }
    }
}
