namespace EventFlow.Api.Configuration;

public sealed class S3StorageOptions
{
    public const string SectionName = "S3";

    public string AccessKey { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public string Region { get; init; } = string.Empty;
    public string BucketName { get; init; } = string.Empty;
    public string? PublicBaseUrl { get; init; }
    public string KeyPrefix { get; init; } = "eventflow";
}
