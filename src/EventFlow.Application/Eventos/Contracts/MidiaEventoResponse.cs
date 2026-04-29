namespace EventFlow.Application.Eventos.Contracts;

public sealed record MidiaEventoResponse(
    Guid Id,
    string Url,
    int Tipo,
    string? Alt,
    bool Destaque,
    int Ordem);
