using EventFlow.Domain.Common;
using EventFlow.Domain.Enums;

namespace EventFlow.Domain.Entities;

public sealed class Usuario : Entity
{
    public Usuario(
        string nome,
        string email,
        string senhaHash,
        PapelUsuario papel = PapelUsuario.Usuario,
        Guid? id = null) : base(id)
    {
        AtualizarNome(nome);
        AtualizarEmail(email);
        AtualizarSenhaHash(senhaHash);
        Papel = papel;
    }

    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public PapelUsuario Papel { get; private set; }

    public void AtualizarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            throw new ArgumentException("O nome do usuario e obrigatorio.", nameof(nome));
        }

        Nome = nome.Trim();
    }

    public void AtualizarEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("O e-mail do usuario e obrigatorio.", nameof(email));
        }

        Email = email.Trim().ToLowerInvariant();
    }

    public void AtualizarSenhaHash(string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(senhaHash))
        {
            throw new ArgumentException("O hash da senha e obrigatorio.", nameof(senhaHash));
        }

        SenhaHash = senhaHash.Trim();
    }

    public void AlterarPapel(PapelUsuario papel)
    {
        Papel = papel;
    }
}
