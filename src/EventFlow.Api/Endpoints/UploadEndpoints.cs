using EventFlow.Api.Services;

namespace EventFlow.Api.Endpoints;

public static class UploadEndpoints
{
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
        IS3UploadService uploadService,
        CancellationToken cancellationToken)
    {
        var form = await httpContext.Request.ReadFormAsync(cancellationToken);
        var file = form.Files["file"];

        if (file is null || file.Length == 0)
        {
            return Results.BadRequest(new { message = "Nenhum arquivo foi enviado." });
        }

        try
        {
            var uploaded = await uploadService.UploadAsync(file, cancellationToken);

            return Results.Ok(new
            {
                fileName = uploaded.FileName,
                contentType = uploaded.ContentType,
                key = uploaded.Key,
                url = uploaded.Url
            });
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { message = exception.Message });
        }
    }
}
