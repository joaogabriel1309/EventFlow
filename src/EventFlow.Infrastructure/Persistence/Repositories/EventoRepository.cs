using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventFlow.Infrastructure.Persistence.Repositories;

public sealed class EventoRepository(EventFlowDbContext dbContext) : IEventoRepository
{
    public async Task AddAsync(Evento evento, CancellationToken cancellationToken = default)
    {
        await dbContext.Eventos.AddAsync(evento, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Evento?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Eventos
            .AsNoTracking()
            .Include(x => x.Midias)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Evento?> GetTrackedByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Eventos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Evento>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Eventos
            .AsNoTracking()
            .Include(x => x.Midias)
            .OrderBy(x => x.DataHoraInicio)
            .ToListAsync(cancellationToken);
    }

    public async Task ReplaceMidiasAsync(
        Guid eventoId,
        IReadOnlyCollection<MidiaEvento> midias,
        CancellationToken cancellationToken = default)
    {
        await dbContext.MidiasEvento
            .Where(x => EF.Property<Guid>(x, "evento_id") == eventoId)
            .ExecuteDeleteAsync(cancellationToken);

        foreach (var midia in midias)
        {
            dbContext.MidiasEvento.Add(midia);
            dbContext.Entry(midia).Property("evento_id").CurrentValue = eventoId;
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Evento evento, CancellationToken cancellationToken = default)
    {
        dbContext.Eventos.Remove(evento);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
