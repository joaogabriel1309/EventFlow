namespace EventFlow.Api.Services;

public sealed record S3UploadResult(
    string FileName,
    string ContentType,
    string Key,
    string Url);
