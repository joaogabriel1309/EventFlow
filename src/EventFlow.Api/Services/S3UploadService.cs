using Amazon.S3;
using Amazon.S3.Model;
using EventFlow.Api.Configuration;
using Microsoft.Extensions.Options;

namespace EventFlow.Api.Services;

public sealed class S3UploadService : IS3UploadService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".mp4",
        ".webm"
    };

    private readonly IAmazonS3 _amazonS3;
    private readonly S3StorageOptions _options;

    public S3UploadService(IAmazonS3 amazonS3, IOptions<S3StorageOptions> options)
    {
        _amazonS3 = amazonS3;
        _options = options.Value;
    }

    public async Task<S3UploadResult> UploadAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("Nenhum arquivo foi enviado.");
        }

        var extension = Path.GetExtension(file.FileName);

        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Tipo de arquivo nao suportado.");
        }

        const long maxFileSize = 25 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException("O arquivo excede o limite de 25 MB.");
        }

        var safeFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var normalizedPrefix = _options.KeyPrefix.Trim().Trim('/');
        var objectKey = string.IsNullOrWhiteSpace(normalizedPrefix)
            ? safeFileName
            : $"{normalizedPrefix}/eventos/{safeFileName}";

        await using var stream = file.OpenReadStream();

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            AutoCloseStream = false,
            CannedACL = S3CannedACL.PublicRead
        };

        await _amazonS3.PutObjectAsync(request, cancellationToken);

        var baseUrl = string.IsNullOrWhiteSpace(_options.PublicBaseUrl)
            ? $"https://{_options.BucketName}.s3.{_options.Region}.amazonaws.com"
            : _options.PublicBaseUrl.TrimEnd('/');

        return new S3UploadResult(
            safeFileName,
            request.ContentType,
            objectKey,
            $"{baseUrl}/{objectKey}");
    }
}
