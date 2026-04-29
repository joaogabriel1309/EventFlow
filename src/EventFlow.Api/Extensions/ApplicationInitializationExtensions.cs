using EventFlow.Infrastructure.Auth;

namespace EventFlow.Api.Extensions;

public static class ApplicationInitializationExtensions
{
    public static async Task InitializeAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var adminBootstrapper = scope.ServiceProvider.GetRequiredService<AdminBootstrapper>();
        await adminBootstrapper.EnsureAdminAsync();
    }
}
