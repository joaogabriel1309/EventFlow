using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventFlow.Infrastructure.Persistence.Repositories;

public sealed class UsuarioRepository(EventFlowDbContext dbContext) : IUsuarioRepository
{
    public async Task AddAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        await dbContext.Usuarios.AddAsync(usuario, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Usuarios
            .AsNoTracking()
            .AnyAsync(x => x.Email == email, cancellationToken);
    }

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public async Task<Usuario?> GetTrackedByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Usuarios
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
