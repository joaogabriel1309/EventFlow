using EventFlow.Application.Abstractions.Auth;
using EventFlow.Application.Abstractions.Persistence;
using EventFlow.Application.Auth.Contracts;
using EventFlow.Domain.Entities;
using EventFlow.Domain.Enums;
using FluentValidation;

namespace EventFlow.Application.Auth.Services;

public sealed class AuthService(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IValidator<RegistrarUsuarioRequest> registrarUsuarioValidator,
    IValidator<LoginRequest> loginValidator) : IAuthService
{
    public async Task<AuthResponse> RegistrarAsync(
        RegistrarUsuarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await registrarUsuarioValidator.ValidateAndThrowAsync(request, cancellationToken);

        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var usuarioExistente = await usuarioRepository.ExistsByEmailAsync(emailNormalizado, cancellationToken);
        if (usuarioExistente)
        {
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(nameof(request.Email), "Ja existe um usuario com este e-mail.")
            });
        }

        var usuario = new Usuario(
            request.Nome,
            emailNormalizado,
            passwordHasher.Hash(request.Senha),
            PapelUsuario.Usuario);

        await usuarioRepository.AddAsync(usuario, cancellationToken);

        return Map(usuario);
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        await loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var usuario = await usuarioRepository.GetByEmailAsync(emailNormalizado, cancellationToken);
        if (usuario is null || !passwordHasher.Verify(request.Senha, usuario.SenhaHash))
        {
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(nameof(request.Email), "Credenciais invalidas.")
            });
        }

        return Map(usuario);
    }

    private AuthResponse Map(Usuario usuario)
    {
        var token = tokenService.GenerateAccessToken(usuario);

        return new AuthResponse(
            token.AccessToken,
            token.ExpiresAtUtc,
            new UsuarioAutenticadoResponse(
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Papel.ToString()));
    }
}
