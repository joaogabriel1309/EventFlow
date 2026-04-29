namespace EventFlow.Application.Auth.Contracts;

public sealed record UsuarioAutenticadoResponse(
    Guid Id,
    string Nome,
    string Email,
    string Papel);
