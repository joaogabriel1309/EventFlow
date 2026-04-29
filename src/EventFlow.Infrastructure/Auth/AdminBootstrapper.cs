using EventFlow.Application.Abstractions.Auth;
using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Auth;
using EventFlow.Domain.Entities;
using EventFlow.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EventFlow.Infrastructure.Auth;

public sealed class AdminBootstrapper(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IOptions<AdminBootstrapOptions> options,
    ILogger<AdminBootstrapper> logger)
{
    private readonly AdminBootstrapOptions _options = options.Value;

    public async Task EnsureAdminAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.Nome) ||
            string.IsNullOrWhiteSpace(_options.Email) ||
            string.IsNullOrWhiteSpace(_options.Senha))
        {
            logger.LogWarning("Admin bootstrap is enabled, but its configuration is incomplete.");
            return;
        }

        var email = _options.Email.Trim().ToLowerInvariant();
        var usuario = await usuarioRepository.GetTrackedByEmailAsync(email, cancellationToken);

        if (usuario is null)
        {
            var admin = new Usuario(
                _options.Nome,
                email,
                passwordHasher.Hash(_options.Senha),
                PapelUsuario.Admin);

            await usuarioRepository.AddAsync(admin, cancellationToken);
            logger.LogInformation("Admin user '{Email}' was created during bootstrap.", email);
            return;
        }

        var changed = false;

        if (_options.PromoteExistingUser && usuario.Papel != PapelUsuario.Admin)
        {
            usuario.AlterarPapel(PapelUsuario.Admin);
            changed = true;
        }

        if (!string.Equals(usuario.Nome, _options.Nome.Trim(), StringComparison.Ordinal))
        {
            usuario.AtualizarNome(_options.Nome);
            changed = true;
        }

        if (_options.UpdatePasswordOnStartup)
        {
            usuario.AtualizarSenhaHash(passwordHasher.Hash(_options.Senha));
            changed = true;
        }

        if (changed)
        {
            await usuarioRepository.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Admin user '{Email}' was updated during bootstrap.", email);
        }
    }
}
