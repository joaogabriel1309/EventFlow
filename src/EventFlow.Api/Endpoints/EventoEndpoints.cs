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

        group.MapPut("/{id:guid}", AtualizarAsync)
            .WithName("AtualizarEvento");

        group.MapDelete("/{id:guid}", ExcluirAsync)
            .WithName("ExcluirEvento");

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
        [AsParameters] ListarEventosQuery query,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        try
        {
            var request = new ListarEventosRequest(
                query.Busca,
                query.Local,
                query.DataInicio,
                query.DataFim,
                query.Page,
                query.PageSize);

            var response = await eventoService.ListarAsync(request, cancellationToken);
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

    private static async Task<IResult> ObterPorIdAsync(
        Guid id,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        var response = await eventoService.ObterPorIdAsync(id, cancellationToken);
        return response is null ? Results.NotFound() : Results.Ok(response);
    }

    private static async Task<IResult> AtualizarAsync(
        Guid id,
        AtualizarEventoRequest request,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await eventoService.AtualizarAsync(id, request, cancellationToken);
            return response is null ? Results.NotFound() : Results.Ok(response);
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

    private static async Task<IResult> ExcluirAsync(
        Guid id,
        IEventoService eventoService,
        CancellationToken cancellationToken)
    {
        var excluido = await eventoService.ExcluirAsync(id, cancellationToken);
        return excluido ? Results.NoContent() : Results.NotFound();
    }

    public sealed record ListarEventosQuery(
        string? Busca,
        string? Local,
        DateTimeOffset? DataInicio,
        DateTimeOffset? DataFim,
        int Page = 1,
        int PageSize = 10);
}
