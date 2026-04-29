using EventFlow.Domain.Common;

namespace EventFlow.Domain.Entities;

public sealed class Evento : Entity
{
    private readonly List<MidiaEvento> _midias = [];

    public Evento(
        string titulo,
        string descricao,
        DateTimeOffset dataHoraInicio,
        DateTimeOffset dataHoraFim,
        string local,
        int capacidade,
        decimal preco,
        IEnumerable<MidiaEvento>? midias = null,
        Guid? id = null) : base(id)
    {
        AtualizarDetalhes(titulo, descricao, dataHoraInicio, dataHoraFim, local, capacidade, preco);

        if (midias is not null)
        {
            _midias.AddRange(midias);
        }
    }

    public string Titulo { get; private set; } = string.Empty;
    public string Descricao { get; private set; } = string.Empty;
    public DateTimeOffset DataHoraInicio { get; private set; }
    public DateTimeOffset DataHoraFim { get; private set; }
    public string Local { get; private set; } = string.Empty;
    public int Capacidade { get; private set; }
    public decimal Preco { get; private set; }
    public IReadOnlyCollection<MidiaEvento> Midias => _midias.AsReadOnly();

    public void AtualizarDetalhes(
        string titulo,
        string descricao,
        DateTimeOffset dataHoraInicio,
        DateTimeOffset dataHoraFim,
        string local,
        int capacidade,
        decimal preco)
    {
        if (string.IsNullOrWhiteSpace(titulo))
        {
            throw new ArgumentException("O titulo do evento e obrigatorio.", nameof(titulo));
        }

        if (string.IsNullOrWhiteSpace(descricao))
        {
            throw new ArgumentException("A descricao do evento e obrigatoria.", nameof(descricao));
        }

        if (string.IsNullOrWhiteSpace(local))
        {
            throw new ArgumentException("O local do evento e obrigatorio.", nameof(local));
        }

        if (capacidade <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(capacidade), "A capacidade deve ser maior que zero.");
        }

        if (preco < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(preco), "O preco nao pode ser negativo.");
        }

        if (dataHoraFim <= dataHoraInicio)
        {
            throw new ArgumentException("A data final do evento deve ser maior que a data inicial.");
        }

        Titulo = titulo.Trim();
        Descricao = descricao.Trim();
        DataHoraInicio = dataHoraInicio;
        DataHoraFim = dataHoraFim;
        Local = local.Trim();
        Capacidade = capacidade;
        Preco = decimal.Round(preco, 2, MidpointRounding.AwayFromZero);
    }

    public void DefinirMidias(IEnumerable<MidiaEvento> midias)
    {
        ArgumentNullException.ThrowIfNull(midias);

        _midias.Clear();
        _midias.AddRange(midias);
    }
}
