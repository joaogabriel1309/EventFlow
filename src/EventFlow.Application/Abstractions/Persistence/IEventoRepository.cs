using EventFlow.Domain.Entities;

namespace EventFlow.Application.Abstractions.Persistence;

public interface IEventoRepository
{
    Task AddAsync(Evento evento, CancellationToken cancellationToken = default);
    Task<Evento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Evento?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Evento>> ListAsync(CancellationToken cancellationToken = default);
    Task ReplaceMidiasAsync(Guid eventoId, IReadOnlyCollection<MidiaEvento> midias, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task RemoveAsync(Evento evento, CancellationToken cancellationToken = default);
}
