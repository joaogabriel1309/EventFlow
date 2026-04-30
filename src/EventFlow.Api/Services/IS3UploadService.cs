namespace EventFlow.Api.Services;

public interface IS3UploadService
{
    Task<S3UploadResult> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);
}
