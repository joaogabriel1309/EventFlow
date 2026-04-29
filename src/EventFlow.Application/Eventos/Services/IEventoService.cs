using EventFlow.Application.Eventos.Contracts;

namespace EventFlow.Application.Eventos.Services;

public interface IEventoService
{
    Task<EventoResponse> CriarAsync(CriarEventoRequest request, CancellationToken cancellationToken = default);
    Task<EventoResponse?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EventoResponse>> ListarAsync(CancellationToken cancellationToken = default);
}
