using EventFlow.Domain.Entities;

namespace EventFlow.Application.Abstractions.Auth;

public interface ITokenService
{
    TokenResult GenerateAccessToken(Usuario usuario);
}
