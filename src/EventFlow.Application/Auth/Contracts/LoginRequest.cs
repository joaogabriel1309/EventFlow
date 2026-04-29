namespace EventFlow.Application.Auth.Contracts;

public sealed record LoginRequest(
    string Email,
    string Senha);
