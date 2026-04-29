using EventFlow.Application.Auth.Contracts;
using EventFlow.Application.Auth.Services;
using FluentValidation;

namespace EventFlow.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Auth");

        group.MapPost("/register", RegistrarAsync)
            .WithName("RegistrarUsuario");

        group.MapPost("/login", LoginAsync)
            .WithName("LoginUsuario");

        return app;
    }

    private static async Task<IResult> RegistrarAsync(
        RegistrarUsuarioRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await authService.RegistrarAsync(request, cancellationToken);
            return Results.Ok(response);
        }
        catch (ValidationException validationException)
        {
            return Results.ValidationProblem(validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(x => x.ErrorMessage).ToArray()));
        }
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await authService.LoginAsync(request, cancellationToken);
            return Results.Ok(response);
        }
        catch (ValidationException validationException)
        {
            return Results.ValidationProblem(validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(x => x.ErrorMessage).ToArray()));
        }
    }
}
