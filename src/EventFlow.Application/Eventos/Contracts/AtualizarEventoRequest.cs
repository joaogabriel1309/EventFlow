namespace EventFlow.Application.Eventos.Contracts;

public sealed record AtualizarEventoRequest(
    string Titulo,
    string Descricao,
    DateTimeOffset DataHoraInicio,
    DateTimeOffset DataHoraFim,
    string Local,
    int Capacidade,
    decimal Preco,
    IReadOnlyCollection<CriarMidiaEventoRequest>? Midias);
