using EventFlow.Domain.Common;
using EventFlow.Domain.Enums;

namespace EventFlow.Domain.Entities;

public sealed class MidiaEvento : Entity
{
    private MidiaEvento()
    {
    }

    public MidiaEvento(
        string url,
        TipoMidiaEvento tipo,
        string? alt = null,
        bool destaque = false,
        int ordem = 0,
        Guid? id = null) : base(id)
    {
        SetUrl(url);
        Tipo = tipo;
        Alt = alt?.Trim();
        Destaque = destaque;
        Ordem = ordem;
    }

    public string Url { get; private set; } = string.Empty;
    public TipoMidiaEvento Tipo { get; private set; }
    public string? Alt { get; private set; }
    public bool Destaque { get; private set; }
    public int Ordem { get; private set; }

    public void Atualizar(string url, TipoMidiaEvento tipo, string? alt, bool destaque, int ordem)
    {
        SetUrl(url);
        Tipo = tipo;
        Alt = alt?.Trim();
        Destaque = destaque;
        Ordem = ordem;
    }

    private void SetUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new ArgumentException("A URL da midia e obrigatoria.", nameof(url));
        }

        Url = url.Trim();
    }
}
