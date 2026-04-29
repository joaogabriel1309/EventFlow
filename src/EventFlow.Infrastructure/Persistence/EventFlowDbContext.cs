using EventFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventFlow.Infrastructure.Persistence;

public sealed class EventFlowDbContext(DbContextOptions<EventFlowDbContext> options) : DbContext(options)
{
    public DbSet<Evento> Eventos => Set<Evento>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Inscricao> Inscricoes => Set<Inscricao>();
    public DbSet<MidiaEvento> MidiasEvento => Set<MidiaEvento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EventFlowDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
