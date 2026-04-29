namespace EventFlow.Application.Eventos.Contracts;

public sealed record CriarMidiaEventoRequest(
    string Url,
    int Tipo,
    string? Alt,
    bool Destaque,
    int Ordem);
