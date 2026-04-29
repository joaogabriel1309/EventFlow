using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EventFlow.Infrastructure.Extensions;

namespace EventFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddPersistence(configuration);
        services.AddScoped<IEventoRepository, EventoRepository>();

        return services;
    }
}
