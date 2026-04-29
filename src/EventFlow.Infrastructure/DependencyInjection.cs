using EventFlow.Application.Abstractions.Auth;
using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Auth;
using EventFlow.Infrastructure.Auth;
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

        services.Configure<AdminBootstrapOptions>(configuration.GetSection(AdminBootstrapOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddPersistence(configuration);
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddScoped<AdminBootstrapper>();
        services.AddScoped<IEventoRepository, EventoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();

        return services;
    }
}
