using Microsoft.AspNetCore.Http.Features;

namespace EventFlow.Api.Endpoints;

public static class UploadEndpoints
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

    public static IEndpointRouteBuilder MapUploadEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/uploads")
            .WithTags("Uploads")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        group.MapPost("/midia", UploadMidiaAsync)
            .DisableAntiforgery()
            .WithName("UploadMidia");

        return app;
    }

    private static async Task<IResult> UploadMidiaAsync(
        HttpContext httpContext,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        var form = await httpContext.Request.ReadFormAsync(cancellationToken);
        var file = form.Files["file"];

        if (file is null || file.Length == 0)
        {
            return Results.BadRequest(new { message = "Nenhum arquivo foi enviado." });
        }

        var extension = Path.GetExtension(file.FileName);

        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            return Results.BadRequest(new { message = "Tipo de arquivo nao suportado." });
        }

        const long maxFileSize = 25 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return Results.BadRequest(new { message = "O arquivo excede o limite de 25 MB." });
        }

        var webRootPath = environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        var uploadsDirectory = Path.Combine(webRootPath, "uploads", "eventos");
        Directory.CreateDirectory(uploadsDirectory);

        var safeFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDirectory, safeFileName);

        await using (var stream = File.Create(fullPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
        var publicUrl = $"{baseUrl}/uploads/eventos/{safeFileName}";

        return Results.Ok(new
        {
            fileName = safeFileName,
            contentType = file.ContentType,
            url = publicUrl
        });
    }
}
