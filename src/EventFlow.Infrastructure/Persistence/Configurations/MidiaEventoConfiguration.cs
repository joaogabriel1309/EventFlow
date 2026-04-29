using EventFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventFlow.Infrastructure.Persistence.Configurations;

public sealed class MidiaEventoConfiguration : IEntityTypeConfiguration<MidiaEvento>
{
    public void Configure(EntityTypeBuilder<MidiaEvento> builder)
    {
        builder.ToTable("evento_midias");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property<Guid>("evento_id")
            .HasColumnName("evento_id")
            .IsRequired();

        builder.Property(x => x.Url)
            .HasColumnName("url")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .HasColumnName("tipo")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.Alt)
            .HasColumnName("alt")
            .HasMaxLength(200);

        builder.Property(x => x.Destaque)
            .HasColumnName("destaque")
            .IsRequired();

        builder.Property(x => x.Ordem)
            .HasColumnName("ordem")
            .IsRequired();
    }
}
