import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarPreco, obterEvento, type MidiaEvento } from "@/lib/eventos";

type EventoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getDestaqueMidia(midias: MidiaEvento[]) {
  return midias.find((midia) => midia.destaque) ?? midias[0] ?? null;
}

export default async function EventoDetalhePage({ params }: EventoPageProps) {
  const { id } = await params;
  const evento = await obterEvento(id);

  if (!evento) {
    notFound();
  }

  const destaque = getDestaqueMidia(evento.midias);
  const galeria = evento.midias.filter((midia) => midia.id !== destaque?.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,91,49,0.18),_transparent_30%),linear-gradient(180deg,_#fff7f1_0%,_#fffdf9_48%,_#f7f4ed_100%)] text-stone-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-12">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_-45px_rgba(88,44,16,0.45)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6 px-7 py-10 lg:px-12 lg:py-14">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                <Link href="/" className="rounded-full border border-stone-300 px-3 py-1 transition-colors hover:bg-stone-100">
                  Voltar para vitrine
                </Link>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                  Evento ao vivo
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-heading text-5xl uppercase leading-none text-stone-950 sm:text-6xl">{evento.titulo}</h1>
                <p className="max-w-3xl text-lg leading-8 text-stone-700">{evento.descricao}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Data</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-stone-900">{formatarData(evento.dataHoraInicio)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Encerramento</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-stone-900">{formatarData(evento.dataHoraFim)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Local</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-stone-900">{evento.local}</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Capacidade</p>
                  <p className="mt-2 text-sm font-medium leading-7 text-stone-900">{evento.capacidade} participantes</p>
                </div>
              </div>
            </div>

            <aside className="flex flex-col justify-between gap-6 bg-stone-950 p-7 text-white lg:p-10">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Reserva</p>
                <p className="font-heading text-5xl uppercase leading-none">{formatarPreco(evento.preco)}</p>
                <p className="text-sm leading-7 text-stone-300">
                  A proxima etapa natural daqui e conectar inscricao, carrinho ou checkout direto nessa pagina.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">Midias</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  {evento.midias.length === 0
                    ? "Nenhuma midia publicada para este evento ainda."
                    : `${evento.midias.length} arquivo(s) ligado(s) ao evento.`}
                </p>
              </div>
            </aside>
          </div>
        </section>

        {destaque ? (
          <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
            {destaque.tipo === 3 ? (
              <video src={destaque.url} controls className="max-h-[34rem] w-full bg-stone-950 object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={destaque.url} alt={destaque.alt || evento.titulo} className="max-h-[34rem] w-full object-cover" />
            )}
          </section>
        ) : null}

        {galeria.length > 0 ? (
          <section className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Galeria</p>
                <h2 className="font-heading text-4xl uppercase leading-none text-stone-950">Conteudo do evento</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-stone-600">
                Imagens e videos publicados no painel administrativo aparecem aqui automaticamente.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {galeria.map((midia) => (
                <article
                  key={midia.id}
                  className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]"
                >
                  {midia.tipo === 3 ? (
                    <video src={midia.url} controls className="aspect-[4/3] w-full bg-stone-950 object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={midia.url} alt={midia.alt || evento.titulo} className="aspect-[4/3] w-full object-cover" />
                  )}
                  <div className="space-y-2 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      {midia.tipo === 3 ? "Video" : "Imagem"}
                    </p>
                    <p className="text-sm leading-7 text-stone-700">{midia.alt || "Midia publicada sem descricao adicional."}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
