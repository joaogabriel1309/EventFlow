namespace EventFlow.Api.Configuration;

public sealed class S3StorageOptions
{
    public const string SectionName = "S3";

    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string? PublicBaseUrl { get; set; }
    public string KeyPrefix { get; set; } = string.Empty;
}
