using EventFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventFlow.Infrastructure.Persistence.Configurations;

public sealed class EventoConfiguration : IEntityTypeConfiguration<Evento>
{
    public void Configure(EntityTypeBuilder<Evento> builder)
    {
        builder.ToTable("eventos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.Titulo)
            .HasColumnName("titulo")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Descricao)
            .HasColumnName("descricao")
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.DataHoraInicio)
            .HasColumnName("data_hora_inicio")
            .IsRequired();

        builder.Property(x => x.DataHoraFim)
            .HasColumnName("data_hora_fim")
            .IsRequired();

        builder.Property(x => x.Local)
            .HasColumnName("local")
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(x => x.Capacidade)
            .HasColumnName("capacidade")
            .IsRequired();

        builder.Property(x => x.Preco)
            .HasColumnName("preco")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Metadata.FindNavigation(nameof(Evento.Midias))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.Midias)
            .WithOne()
            .HasForeignKey("evento_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
