namespace EventFlow.Api.Services;

public interface IS3UploadService : EventFlow.Application.Eventos.Services.IMidiaUrlResolver
{
    Task<S3UploadResult> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);
}
