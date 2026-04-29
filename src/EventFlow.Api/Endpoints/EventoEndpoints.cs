using EventFlow.Application.Eventos.Contracts;
using EventFlow.Application.Eventos.Services;
using FluentValidation;

namespace EventFlow.Api.Endpoints;

public static class EventoEndpoints
{
    public static IEndpointRouteBuilder MapEventoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/eventos")
            .WithTags("Eventos");

        group.MapPost("/", CriarAsync)
            .WithName("CriarEvento");

        group.MapGet("/", ListarAsync)
            .WithName("ListarEventos");

        group.MapGet("/{id:guid}", ObterPorIdAsync)
            .WithName("ObterEventoPorId");

        return app;
    }

    private static async Task<IResult> CriarAsync(
        CriarEventoRequest request,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await eventoService.CriarAsync(request, cancellationToken);
            return Results.Created($"/api/eventos/{response.Id}", response);
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

    private static async Task<IResult> ListarAsync(
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        var response = await eventoService.ListarAsync(cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> ObterPorIdAsync(
        Guid id,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        var response = await eventoService.ObterPorIdAsync(id, cancellationToken);
        return response is null ? Results.NotFound() : Results.Ok(response);
    }
}
