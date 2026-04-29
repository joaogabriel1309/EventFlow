using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Eventos.Contracts;
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

    public async Task<(IReadOnlyList<Evento> Items, int TotalItems)> ListAsync(
        ListarEventosRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Eventos
            .AsNoTracking()
            .Include(x => x.Midias)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Busca))
        {
            var busca = request.Busca.Trim().ToLower();
            query = query.Where(x =>
                x.Titulo.ToLower().Contains(busca) ||
                x.Descricao.ToLower().Contains(busca));
        }

        if (!string.IsNullOrWhiteSpace(request.Local))
        {
            var local = request.Local.Trim().ToLower();
            query = query.Where(x => x.Local.ToLower().Contains(local));
        }

        if (request.DataInicio.HasValue)
        {
            query = query.Where(x => x.DataHoraInicio >= request.DataInicio.Value);
        }

        if (request.DataFim.HasValue)
        {
            query = query.Where(x => x.DataHoraInicio <= request.DataFim.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.DataHoraInicio)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalItems);
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
