using EventFlow.Application.Eventos.Contracts;
using FluentValidation;

namespace EventFlow.Application.Eventos.Validators;

public sealed class ListarEventosRequestValidator : AbstractValidator<ListarEventosRequest>
{
    public ListarEventosRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.DataFim)
            .GreaterThanOrEqualTo(x => x.DataInicio!.Value)
            .When(x => x.DataInicio.HasValue && x.DataFim.HasValue);
    }
}
