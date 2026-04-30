"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { criarEvento, excluirEvento, listarEventosAdmin } from "@/lib/admin-eventos";
import { obterSessao, type UsuarioAutenticado } from "@/lib/auth";
import { formatarData, formatarPreco, type Evento } from "@/lib/eventos";

function toDateTimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

const initialForm = {
  titulo: "",
  descricao: "",
  dataHoraInicio: toDateTimeLocalValue(new Date(Date.now() + 86_400_000)),
  dataHoraFim: toDateTimeLocalValue(new Date(Date.now() + 90_000_000)),
  local: "",
  capacidade: 50,
  preco: 0,
};

export function AdminDashboard() {
  const [usuario] = useState<UsuarioAutenticado | null>(() => obterSessao()?.usuario ?? null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, startLoadingTransition] = useTransition();
  const [salvando, startSavingTransition] = useTransition();
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    startLoadingTransition(async () => {
      if (!usuario) {
        return;
      }

      try {
        const resultado = await listarEventosAdmin();
        setEventos(resultado.items);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel carregar os eventos.");
      }
    });
  }, [usuario]);

  async function handleCreate(formData: FormData) {
    const titulo = String(formData.get("titulo") ?? "");
    const descricao = String(formData.get("descricao") ?? "");
    const dataHoraInicio = String(formData.get("dataHoraInicio") ?? "");
    const dataHoraFim = String(formData.get("dataHoraFim") ?? "");
    const local = String(formData.get("local") ?? "");
    const capacidade = Number(formData.get("capacidade") ?? 0);
    const preco = Number(formData.get("preco") ?? 0);

    setErro(null);
    setFeedback(null);

    startSavingTransition(async () => {
      try {
        const novoEvento = await criarEvento({
          titulo,
          descricao,
          dataHoraInicio: new Date(dataHoraInicio).toISOString(),
          dataHoraFim: new Date(dataHoraFim).toISOString(),
          local,
          capacidade,
          preco,
          midias: [],
        });

        setEventos((current) => [novoEvento, ...current]);
        setFeedback("Evento criado com sucesso.");
        setForm(initialForm);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel criar o evento.");
      }
    });
  }

  function handleDelete(id: string) {
    setErro(null);
    setFeedback(null);
    setExcluindoId(id);

    startLoadingTransition(async () => {
      try {
        await excluirEvento(id);
        setEventos((current) => current.filter((evento) => evento.id !== id));
        setFeedback("Evento removido com sucesso.");
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel excluir o evento.");
      } finally {
        setExcluindoId(null);
      }
    });
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,91,49,0.22),_transparent_36%),linear-gradient(180deg,_#fff7f1_0%,_#fffdf9_48%,_#f7f4ed_100%)] px-6 py-10 text-stone-900 sm:px-10 lg:px-12">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_90px_-45px_rgba(88,44,16,0.45)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Area administrativa</p>
          <h1 className="font-heading text-6xl uppercase leading-none text-stone-950">Login necessario</h1>
          <p className="max-w-2xl text-base leading-8 text-stone-700">
            A sessao JWT nao foi encontrada no navegador. Volte para a home, entre com o admin e retorne para continuar.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Voltar para login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(227,91,49,0.22),_transparent_36%),linear-gradient(180deg,_#fff7f1_0%,_#fffdf9_48%,_#f7f4ed_100%)] text-stone-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-12">
        <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_90px_-45px_rgba(88,44,16,0.45)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Painel admin</p>
            <h1 className="font-heading text-6xl uppercase leading-none text-stone-950">Gestao de eventos</h1>
            <p className="max-w-2xl text-base leading-8 text-stone-700">
              Sessao autenticada como <strong>{usuario.nome}</strong>. Aqui ja usamos o JWT salvo no login para criar e
              remover eventos no backend.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-stone-950 p-6 text-stone-50">
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Status</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-300">
              <p>{usuario.email}</p>
              <p>Papel: {usuario.papel}</p>
              <p>{carregando ? "Sincronizando eventos..." : `${eventos.length} evento(s) carregado(s)`}</p>
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-stone-950"
            >
              Voltar para vitrine
            </Link>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Novo evento</p>
            <h2 className="mt-3 font-heading text-4xl uppercase leading-none text-stone-950">Cadastro rapido</h2>

            <form action={handleCreate} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Titulo</span>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Descricao</span>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                  className="min-h-32 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Inicio</span>
                  <input
                    type="datetime-local"
                    name="dataHoraInicio"
                    value={form.dataHoraInicio}
                    onChange={(event) => setForm((current) => ({ ...current, dataHoraInicio: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Fim</span>
                  <input
                    type="datetime-local"
                    name="dataHoraFim"
                    value={form.dataHoraFim}
                    onChange={(event) => setForm((current) => ({ ...current, dataHoraFim: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_160px_160px]">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Local</span>
                  <input
                    name="local"
                    value={form.local}
                    onChange={(event) => setForm((current) => ({ ...current, local: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Capacidade</span>
                  <input
                    type="number"
                    name="capacidade"
                    min="1"
                    value={form.capacidade}
                    onChange={(event) => setForm((current) => ({ ...current, capacidade: Number(event.target.value) }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Preco</span>
                  <input
                    type="number"
                    name="preco"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={(event) => setForm((current) => ({ ...current, preco: Number(event.target.value) }))}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                    required
                  />
                </label>
              </div>

              {erro ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
              ) : null}

              {feedback ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {salvando ? "Salvando..." : "Criar evento"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Acervo</p>
                <h2 className="font-heading text-4xl uppercase leading-none text-stone-950">Eventos atuais</h2>
              </div>
            </div>

            <div className="grid gap-4">
              {eventos.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white px-8 py-16 text-center text-stone-600">
                  Nenhum evento disponivel ainda.
                </div>
              ) : (
                eventos.map((evento) => (
                  <article
                    key={evento.id}
                    className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-heading text-3xl uppercase leading-none text-stone-950">{evento.titulo}</h3>
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                            {formatarPreco(evento.preco)}
                          </span>
                        </div>
                        <p className="max-w-2xl text-sm leading-7 text-stone-700">{evento.descricao}</p>
                        <div className="grid gap-2 text-sm text-stone-600 sm:grid-cols-3">
                          <p>
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Inicio</span>
                            {formatarData(evento.dataHoraInicio)}
                          </p>
                          <p>
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Local</span>
                            {evento.local}
                          </p>
                          <p>
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Capacidade</span>
                            {evento.capacidade} pessoas
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(evento.id)}
                        disabled={excluindoId === evento.id}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {excluindoId === evento.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
