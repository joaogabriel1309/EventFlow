using EventFlow.Application.Common.Contracts;
using EventFlow.Application.Eventos.Contracts;

namespace EventFlow.Application.Eventos.Services;

public interface IEventoService
{
    Task<EventoResponse> CriarAsync(CriarEventoRequest request, CancellationToken cancellationToken = default);
    Task<bool> ExcluirAsync(Guid id, CancellationToken cancellationToken = default);
    Task<EventoResponse?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<EventoResponse?> AtualizarAsync(Guid id, AtualizarEventoRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<EventoResponse>> ListarAsync(ListarEventosRequest request, CancellationToken cancellationToken = default);
}
