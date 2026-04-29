using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Eventos.Contracts;
using EventFlow.Domain.Entities;
using EventFlow.Domain.Enums;
using FluentValidation;

namespace EventFlow.Application.Eventos.Services;

public sealed class EventoService(
    IEventoRepository eventoRepository,
    IValidator<CriarEventoRequest> criarEventoValidator,
    IValidator<AtualizarEventoRequest> atualizarEventoValidator) : IEventoService
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

    public async Task<EventoResponse?> AtualizarAsync(
        Guid id,
        AtualizarEventoRequest request,
        CancellationToken cancellationToken = default)
    {
        await atualizarEventoValidator.ValidateAndThrowAsync(request, cancellationToken);

        var evento = await eventoRepository.GetTrackedByIdAsync(id, cancellationToken);
        if (evento is null)
        {
            return null;
        }

        evento.AtualizarDetalhes(
            request.Titulo,
            request.Descricao,
            request.DataHoraInicio,
            request.DataHoraFim,
            request.Local,
            request.Capacidade,
            request.Preco);

        var midias = request.Midias?
            .OrderBy(x => x.Ordem)
            .Select(x => new MidiaEvento(
                x.Url,
                (TipoMidiaEvento)x.Tipo,
                x.Alt,
                x.Destaque,
                x.Ordem))
            .ToArray() ?? [];

        await eventoRepository.ReplaceMidiasAsync(evento.Id, midias, cancellationToken);

        await eventoRepository.SaveChangesAsync(cancellationToken);

        return Map(evento, midias);
    }

    public async Task<IReadOnlyList<EventoResponse>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var eventos = await eventoRepository.ListAsync(cancellationToken);
        return eventos.Select(evento => Map(evento)).ToArray();
    }

    public async Task<bool> ExcluirAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var evento = await eventoRepository.GetTrackedByIdAsync(id, cancellationToken);
        if (evento is null)
        {
            return false;
        }

        await eventoRepository.RemoveAsync(evento, cancellationToken);
        return true;
    }

    private static EventoResponse Map(Evento evento, IReadOnlyCollection<MidiaEvento>? midiasOverride = null)
    {
        var midias = midiasOverride ?? evento.Midias;

        return new EventoResponse(
            evento.Id,
            evento.Titulo,
            evento.Descricao,
            evento.DataHoraInicio,
            evento.DataHoraFim,
            evento.Local,
            evento.Capacidade,
            evento.Preco,
            midias
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
