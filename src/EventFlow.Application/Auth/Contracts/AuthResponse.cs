namespace EventFlow.Application.Auth.Contracts;

public sealed record AuthResponse(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    UsuarioAutenticadoResponse Usuario);
