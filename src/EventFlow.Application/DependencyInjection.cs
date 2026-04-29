using EventFlow.Application.Auth.Services;
using EventFlow.Application.Auth.Validators;
using EventFlow.Application.Eventos.Contracts;
using EventFlow.Application.Eventos.Services;
using EventFlow.Application.Eventos.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EventFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEventoService, EventoService>();
        services.AddScoped<IValidator<EventFlow.Application.Auth.Contracts.LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<EventFlow.Application.Auth.Contracts.RegistrarUsuarioRequest>, RegistrarUsuarioRequestValidator>();
        services.AddScoped<IValidator<CriarEventoRequest>, CriarEventoRequestValidator>();
        services.AddScoped<IValidator<AtualizarEventoRequest>, AtualizarEventoRequestValidator>();
        services.AddScoped<IValidator<ListarEventosRequest>, ListarEventosRequestValidator>();

        return services;
    }
}
