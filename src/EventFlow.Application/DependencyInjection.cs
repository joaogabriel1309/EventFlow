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
        services.AddScoped<IEventoService, EventoService>();
        services.AddScoped<IValidator<CriarEventoRequest>, CriarEventoRequestValidator>();
        services.AddScoped<IValidator<AtualizarEventoRequest>, AtualizarEventoRequestValidator>();

        return services;
    }
}
