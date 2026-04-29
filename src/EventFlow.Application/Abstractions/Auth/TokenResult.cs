namespace EventFlow.Application.Abstractions.Auth;

public sealed record TokenResult(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc);
