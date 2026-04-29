using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Eventos.Contracts;
using EventFlow.Domain.Entities;
using EventFlow.Domain.Enums;
using FluentValidation;

namespace EventFlow.Application.Eventos.Services;

public sealed class EventoService(
    IEventoRepository eventoRepository,
    IValidator<CriarEventoRequest> criarEventoValidator) : IEventoService
{
    public async Task<EventoResponse> CriarAsync(CriarEventoRequest request, CancellationToken cancellationToken = default)
    {
        await criarEventoValidator.ValidateAndThrowAsync(request, cancellationToken);

        var midias = request.Midias?
            .OrderBy(x => x.Ordem)
            .Select(x => new MidiaEvento(
                x.Url,
                (TipoMidiaEvento)x.Tipo,
                x.Alt,
                x.Destaque,
                x.Ordem))
            .ToArray();

        var evento = new Evento(
            request.Titulo,
            request.Descricao,
            request.DataHoraInicio,
            request.DataHoraFim,
            request.Local,
            request.Capacidade,
            request.Preco,
            midias);

        await eventoRepository.AddAsync(evento, cancellationToken);

        return Map(evento);
    }

    public async Task<EventoResponse?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var evento = await eventoRepository.GetByIdAsync(id, cancellationToken);
        return evento is null ? null : Map(evento);
    }

    public async Task<IReadOnlyList<EventoResponse>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var eventos = await eventoRepository.ListAsync(cancellationToken);
        return eventos.Select(Map).ToArray();
    }

    private static EventoResponse Map(Evento evento)
    {
        return new EventoResponse(
            evento.Id,
            evento.Titulo,
            evento.Descricao,
            evento.DataHoraInicio,
            evento.DataHoraFim,
            evento.Local,
            evento.Capacidade,
            evento.Preco,
            evento.Midias
                .OrderBy(x => x.Ordem)
                .Select(midia => new MidiaEventoResponse(
                    midia.Id,
                    midia.Url,
                    (int)midia.Tipo,
                    midia.Alt,
                    midia.Destaque,
                    midia.Ordem))
                .ToArray());
    }
}
