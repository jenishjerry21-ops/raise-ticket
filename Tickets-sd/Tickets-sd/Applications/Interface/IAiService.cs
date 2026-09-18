using SmartDesk.Api.Applications.DTOs;

namespace SmartDesk.Api.Applications.Interface;

public interface IAiService
{
    Task<AiClassificationResponse?> ClassifyTicketAsync(
        string subject,
        string description,
        CancellationToken cancellationToken = default);
}
