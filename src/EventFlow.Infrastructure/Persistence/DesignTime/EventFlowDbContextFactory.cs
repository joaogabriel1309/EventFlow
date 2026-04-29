using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EventFlow.Infrastructure.Persistence.DesignTime;

public sealed class EventFlowDbContextFactory : IDesignTimeDbContextFactory<EventFlowDbContext>
{
    public EventFlowDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<EventFlowDbContext>();
        var connectionString =
            "Host=localhost;Port=5432;Database=eventflow_db;Username=eventflow;Password=eventflow123";

        optionsBuilder.UseNpgsql(connectionString);

        return new EventFlowDbContext(optionsBuilder.Options);
    }
}
