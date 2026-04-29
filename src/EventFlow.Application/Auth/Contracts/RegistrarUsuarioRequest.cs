namespace EventFlow.Application.Auth.Contracts;

public sealed record RegistrarUsuarioRequest(
    string Nome,
    string Email,
    string Senha);
