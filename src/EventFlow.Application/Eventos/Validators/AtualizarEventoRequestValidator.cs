using EventFlow.Application.Eventos.Contracts;
using EventFlow.Domain.Enums;
using FluentValidation;

namespace EventFlow.Application.Eventos.Validators;

public sealed class AtualizarEventoRequestValidator : AbstractValidator<AtualizarEventoRequest>
{
    public AtualizarEventoRequestValidator()
    {
        RuleFor(x => x.Titulo)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Descricao)
            .NotEmpty()
            .MaximumLength(4000);

        RuleFor(x => x.Local)
            .NotEmpty()
            .MaximumLength(300);

        RuleFor(x => x.Capacidade)
            .GreaterThan(0);

        RuleFor(x => x.Preco)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.DataHoraFim)
            .GreaterThan(x => x.DataHoraInicio);

        RuleForEach(x => x.Midias)
            .SetValidator(new AtualizarMidiaEventoRequestValidator());
    }

    private sealed class AtualizarMidiaEventoRequestValidator : AbstractValidator<CriarMidiaEventoRequest>
    {
        public AtualizarMidiaEventoRequestValidator()
        {
            RuleFor(x => x.Url)
                .NotEmpty()
                .MaximumLength(1000);

            RuleFor(x => x.Tipo)
                .Must(tipo => Enum.IsDefined(typeof(TipoMidiaEvento), tipo))
                .WithMessage("Tipo de midia invalido.");

            RuleFor(x => x.Alt)
                .MaximumLength(200);

            RuleFor(x => x.Ordem)
                .GreaterThanOrEqualTo(0);
        }
    }
}
