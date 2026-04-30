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

var s3Options = builder.Configuration
    .GetSection(S3StorageOptions.SectionName)
    .Get<S3StorageOptions>() ?? new S3StorageOptions();

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services
    .AddOptions<S3StorageOptions>()
    .Bind(builder.Configuration.GetSection(S3StorageOptions.SectionName));

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var credentials = new BasicAWSCredentials(s3Options.AccessKey, s3Options.SecretKey);
    var config = new AmazonS3Config
    {
        RegionEndpoint = RegionEndpoint.GetBySystemName(s3Options.Region)
    };

    return new AmazonS3Client(credentials, config);
});

builder.Services.AddScoped<IS3UploadService, S3UploadService>();

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
