namespace EventFlow.Application.Eventos.Contracts;

public sealed record ListarEventosRequest(
    string? Busca,
    string? Local,
    DateTimeOffset? DataInicio,
    DateTimeOffset? DataFim,
    int Page = 1,
    int PageSize = 10);
