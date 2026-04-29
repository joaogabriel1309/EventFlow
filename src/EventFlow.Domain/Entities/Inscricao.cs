using EventFlow.Domain.Common;
using EventFlow.Domain.Enums;

namespace EventFlow.Domain.Entities;

public sealed class Inscricao : Entity
{
    public Inscricao(
        Guid eventoId,
        Guid usuarioId,
        StatusInscricao status = StatusInscricao.Pendente,
        DateTimeOffset? dataInscricao = null,
        string? qrCode = null,
        Guid? id = null) : base(id)
    {
        if (eventoId == Guid.Empty)
        {
            throw new ArgumentException("O evento da inscricao e obrigatorio.", nameof(eventoId));
        }

        if (usuarioId == Guid.Empty)
        {
            throw new ArgumentException("O usuario da inscricao e obrigatorio.", nameof(usuarioId));
        }

        EventoId = eventoId;
        UsuarioId = usuarioId;
        Status = status;
        DataInscricao = dataInscricao ?? DateTimeOffset.UtcNow;
        QrCode = qrCode?.Trim();
    }

    public Guid EventoId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public StatusInscricao Status { get; private set; }
    public DateTimeOffset DataInscricao { get; private set; }
    public string? QrCode { get; private set; }

    public void Confirmar(string qrCode)
    {
        if (string.IsNullOrWhiteSpace(qrCode))
        {
            throw new ArgumentException("O QR Code e obrigatorio para confirmar a inscricao.", nameof(qrCode));
        }

        Status = StatusInscricao.Confirmada;
        QrCode = qrCode.Trim();
    }

    public void Cancelar()
    {
        Status = StatusInscricao.Cancelada;
    }

    public void RegistrarCheckIn()
    {
        if (Status != StatusInscricao.Confirmada)
        {
            throw new InvalidOperationException("A inscricao precisa estar confirmada para registrar check-in.");
        }

        Status = StatusInscricao.CheckInRealizado;
    }
}
