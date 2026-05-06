namespace EventFlow.Api.Configuration;

public static class S3ConfigurationResolver
{
    public static S3StorageOptions Resolve(IConfiguration configuration)
    {
        return new S3StorageOptions
        {
            AccessKey = FirstNonEmpty(
                configuration["S3:AccessKey"],
                configuration["AWS_ACCESS_KEY_ID"]),
            SecretKey = FirstNonEmpty(
                configuration["S3:SecretKey"],
                configuration["AWS_SECRET_ACCESS_KEY"]),
            Region = FirstNonEmpty(
                configuration["S3:Region"],
                configuration["AWS_REGION"],
                configuration["AWS_DEFAULT_REGION"]),
            BucketName = FirstNonEmpty(
                configuration["S3:BucketName"],
                configuration["AWS_S3_BUCKET"],
                configuration["AWS_BUCKET_NAME"]),
            PublicBaseUrl = FirstNonEmpty(
                configuration["S3:PublicBaseUrl"],
                configuration["AWS_S3_PUBLIC_BASE_URL"]),
            KeyPrefix = FirstNonEmpty(
                configuration["S3:KeyPrefix"],
                configuration["AWS_S3_PRODUCT_IMAGES_PREFIX"],
                configuration["AWS_S3_KEY_PREFIX"],
                "produtos")
        };
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim() ?? string.Empty;
    }
}
