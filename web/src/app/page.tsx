import { formatarData, formatarPreco, listarEventos } from "@/lib/eventos";

export default async function Home() {
  const resultado = await listarEventos();
  const eventos = resultado.items;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,91,49,0.22),_transparent_36%),linear-gradient(180deg,_#fff7f1_0%,_#fffdf9_48%,_#f7f4ed_100%)] text-stone-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-10 sm:px-10 lg:px-12">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_-45px_rgba(88,44,16,0.45)] backdrop-blur">
          <div className="grid gap-10 px-7 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">
                Vitrine SSR de Eventos
              </p>
              <div className="space-y-4">
                <h1 className="font-heading text-6xl uppercase leading-none tracking-[0.03em] text-stone-950 sm:text-7xl">
                  EventFlow
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-stone-700">
                  Descubra experiencias presenciais com uma vitrine rapida, indexavel e pronta para conversao.
                  A listagem ja nasce conectada ao backend em .NET com filtros e paginacao.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-stone-700">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <strong className="block text-2xl text-stone-950">{resultado.totalItems}</strong>
                  eventos publicados
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <strong className="block text-2xl text-stone-950">{resultado.totalPages}</strong>
                  paginas disponiveis
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-stretch">
              <div className="rounded-[1.75rem] bg-stone-950 p-6 text-stone-50">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Proxima fase</p>
                <h2 className="mt-3 font-heading text-4xl uppercase leading-none">Inscricoes e tickets</h2>
                <p className="mt-4 text-sm leading-7 text-stone-300">
                  O backend ja suporta autenticacao JWT, CRUD de eventos e consulta publica. O frontend agora pode
                  evoluir para detalhes, checkout e area do usuario.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,_#fff_0%,_#f7efe6_100%)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">API conectada</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Fonte dos dados: <code className="rounded bg-stone-100 px-2 py-1 text-xs">GET /api/eventos</code>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Catalogo</p>
              <h2 className="font-heading text-4xl uppercase leading-none text-stone-950">Eventos em destaque</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-600">
              Esta tela e renderizada no servidor para favorecer SEO e velocidade de primeira carga.
            </p>
          </div>

          {eventos.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center text-stone-600">
              Nenhum evento encontrado no momento.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {eventos.map((evento, index) => (
                <article
                  key={evento.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative min-h-52 overflow-hidden bg-[linear-gradient(135deg,_#2f1b10_0%,_#8f3f22_45%,_#f18e4f_100%)] p-6 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_30%)]" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-orange-100">
                          #{index + 1}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                          {formatarPreco(evento.preco)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading text-4xl uppercase leading-none">{evento.titulo}</h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-orange-50/90">{evento.descricao}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <dl className="grid gap-4 text-sm text-stone-600">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Quando</dt>
                        <dd className="mt-1 font-medium text-stone-900">{formatarData(evento.dataHoraInicio)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Local</dt>
                        <dd className="mt-1 font-medium text-stone-900">{evento.local}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Capacidade</dt>
                        <dd className="mt-1 font-medium text-stone-900">{evento.capacidade} participantes</dd>
                      </div>
                    </dl>

                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.22em] text-stone-400">
                        {evento.midias.length} midia(s)
                      </span>
                      <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
