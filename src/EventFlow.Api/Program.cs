using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using System.Security.Claims;
using System.Text;
using EventFlow.Application;
using EventFlow.Application.Auth;
using EventFlow.Api.Configuration;
using EventFlow.Api.Endpoints;
using EventFlow.Api.Extensions;
using EventFlow.Api.Services;
using EventFlow.Application.Eventos.Services;
using EventFlow.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
const string DevCorsPolicy = "DevCorsPolicy";

var contentRootPath = builder.Environment.ContentRootPath;
var rootDotEnvPath = Path.GetFullPath(Path.Combine(contentRootPath, "..", "..", ".env"));
var apiDotEnvPath = Path.Combine(contentRootPath, ".env");
var dotEnvValues = DotEnvConfigurationLoader.LoadFrom(rootDotEnvPath, apiDotEnvPath);

if (dotEnvValues.Count > 0)
{
    builder.Configuration.AddInMemoryCollection(dotEnvValues);
}

var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();

var s3Options = S3ConfigurationResolver.Resolve(builder.Configuration);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services
    .AddOptions<S3StorageOptions>()
    .Configure(options =>
    {
        options.AccessKey = s3Options.AccessKey;
        options.SecretKey = s3Options.SecretKey;
        options.Region = s3Options.Region;
        options.BucketName = s3Options.BucketName;
        options.PublicBaseUrl = s3Options.PublicBaseUrl;
        options.KeyPrefix = s3Options.KeyPrefix;
    });

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    if (string.IsNullOrWhiteSpace(s3Options.Region))
    {
        throw new InvalidOperationException(
            "A regiao da AWS nao foi configurada. Defina S3__Region ou AWS_REGION no arquivo .env.");
    }

    RegionEndpoint regionEndpoint;

    try
    {
        regionEndpoint = RegionEndpoint.GetBySystemName(s3Options.Region);
    }
    catch (ArgumentException exception)
    {
        throw new InvalidOperationException(
            $"Regiao AWS invalida: '{s3Options.Region}'. Exemplo valido: us-east-2.",
            exception);
    }

    var credentials = new BasicAWSCredentials(s3Options.AccessKey, s3Options.SecretKey);
    var config = new AmazonS3Config
    {
        RegionEndpoint = regionEndpoint
    };

    return new AmazonS3Client(credentials, config);
});

builder.Services.AddScoped<S3UploadService>();
builder.Services.AddScoped<IS3UploadService>(serviceProvider => serviceProvider.GetRequiredService<S3UploadService>());
builder.Services.AddScoped<IMidiaUrlResolver>(serviceProvider => serviceProvider.GetRequiredService<S3UploadService>());

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod();

        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin();
        }
    });
});

builder.Services.AddAuthorization();
builder.Services.AddHealthChecks();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(DevCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    name = "EventFlow API",
    status = "running",
    timestampUtc = DateTime.UtcNow
}));

app.MapHealthChecks("/health");
app.MapAuthEndpoints();
app.MapEventoEndpoints();
app.MapUploadEndpoints();

await app.InitializeAsync();

app.Run();
