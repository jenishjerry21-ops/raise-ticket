using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SmartDesk.Api.Applications.DTOs;
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

    public async Task<AiClassificationResponse?> ClassifyTicketAsync(
        string subject,
        string description,
        CancellationToken cancellationToken = default)
    {
        if (!_configuration.GetValue<bool>("AI:Enabled"))
        {
            _logger.LogInformation("AI is disabled; using local ticket classification.");
            return CreateFallbackClassification(subject, description);
        }

        var apiKey = _configuration["AI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("AI API key is missing; using local ticket classification.");
            return CreateFallbackClassification(subject, description);
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                _configuration["AI:Endpoint"] ?? "https://api.openai.com/v1/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var body = new
            {
                model = _configuration["AI:Model"] ?? "gpt-4o-mini",
                temperature = 0,
                response_format = new { type = "json_object" },
                messages = new object[]
                {
                    new { role = "system", content = "Classify the support ticket. Return only JSON with category (Technical, Billing, Account, General), priority (Low, Medium, High), and a short summary." },
                    new { role = "user", content = $"Subject:\n{subject}\n\nDescription:\n{description}" }
                }
            };

            request.Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            using var response = await client.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("AI service returned {StatusCode}: {Error}", response.StatusCode, error);
                return CreateFallbackClassification(subject, description);
            }

            using var document = JsonDocument.Parse(
                await response.Content.ReadAsStringAsync(cancellationToken));

            if (!document.RootElement.TryGetProperty("choices", out var choices) ||
                choices.ValueKind != JsonValueKind.Array || choices.GetArrayLength() == 0)
            {
                _logger.LogWarning("AI response did not contain any choices.");
                return CreateFallbackClassification(subject, description);
            }

            var message = choices[0].GetProperty("message");
            var content = message.GetProperty("content").GetString();

            if (string.IsNullOrWhiteSpace(content))
                return CreateFallbackClassification(subject, description);

            var jsonContent = ExtractJson(content);
            var result = JsonSerializer.Deserialize<AiClassificationResponse>(
                jsonContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result == null)
                return CreateFallbackClassification(subject, description);

            if (string.IsNullOrWhiteSpace(result.Summary) ||
                !Enum.TryParse<TicketCategory>(result.Category, true, out var category) ||
                !Enum.TryParse<TicketPriority>(result.Priority, true, out var priority))
                return CreateFallbackClassification(subject, description);

            result.Category = category.ToString();
            result.Priority = priority.ToString();
            result.Summary = result.Summary.Trim();

            return result;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogInformation("AI classification was cancelled.");
            return CreateFallbackClassification(subject, description);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "AI service returned invalid JSON.");
            return CreateFallbackClassification(subject, description);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI classification failed");
            return CreateFallbackClassification(subject, description);
        }
    }

    private static AiClassificationResponse CreateFallbackClassification(
        string subject,
        string description)
    {
        var text = $"{subject} {description}".ToLowerInvariant();

        if (ContainsAny(text, "login", "log in", "password", "account", "sign in", "username"))
        {
            return new AiClassificationResponse
            {
                Category = TicketCategory.Account.ToString(),
                Priority = TicketPriority.High.ToString(),
                Summary = "Customer is unable to access their account."
            };
        }

        if (ContainsAny(text, "payment", "billing", "invoice", "charge", "refund", "subscription"))
        {
            return new AiClassificationResponse
            {
                Category = TicketCategory.Billing.ToString(),
                Priority = TicketPriority.High.ToString(),
                Summary = "Customer is reporting a billing or payment problem."
            };
        }

        if (ContainsAny(text, "error", "bug", "crash", "exception", "not working", "failed"))
        {
            return new AiClassificationResponse
            {
                Category = TicketCategory.Technical.ToString(),
                Priority = TicketPriority.High.ToString(),
                Summary = "Customer is reporting a technical problem."
            };
        }

        return new AiClassificationResponse
        {
            Category = TicketCategory.General.ToString(),
            Priority = TicketPriority.Medium.ToString(),
            Summary = "Customer support request received."
        };
    }

    private static bool ContainsAny(string value, params string[] terms)
    {
        return terms.Any(value.Contains);
    }

    private static string ExtractJson(string content)
    {
        var value = content.Trim();

        if (value.StartsWith("```", StringComparison.Ordinal))
        {
            var firstLineEnd = value.IndexOf('\n');
            var lastFence = value.LastIndexOf("```", StringComparison.Ordinal);

            if (firstLineEnd >= 0 && lastFence > firstLineEnd)
                value = value[(firstLineEnd + 1)..lastFence].Trim();
        }

        return value;
    }
}
