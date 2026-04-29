using EventFlow.Application.Auth.Contracts;

namespace EventFlow.Application.Auth.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RegistrarAsync(RegistrarUsuarioRequest request, CancellationToken cancellationToken = default);
}
