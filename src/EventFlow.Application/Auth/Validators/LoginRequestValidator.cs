using EventFlow.Application.Auth.Contracts;
using FluentValidation;

namespace EventFlow.Application.Auth.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(200);

        RuleFor(x => x.Senha)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);
    }
}
