namespace EventFlow.Application.Eventos.Contracts;

public sealed record EventoResponse(
    Guid Id,
    string Titulo,
    string Descricao,
    DateTimeOffset DataHoraInicio,
    DateTimeOffset DataHoraFim,
    string Local,
    int Capacidade,
    decimal Preco,
    IReadOnlyCollection<MidiaEventoResponse> Midias);
