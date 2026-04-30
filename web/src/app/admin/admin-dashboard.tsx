"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  atualizarEvento,
  criarEvento,
  excluirEvento,
  listarEventosAdmin,
  type ListarEventosAdminParams,
} from "@/lib/admin-eventos";
import { obterSessao, type UsuarioAutenticado } from "@/lib/auth";
import { formatarData, formatarPreco, type Evento, type PagedResult } from "@/lib/eventos";

type EventoFormState = {
  titulo: string;
  descricao: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  local: string;
  capacidade: number;
  preco: number;
  midias: MidiaFormState[];
};

type FiltroFormState = {
  busca: string;
  local: string;
  dataInicio: string;
  dataFim: string;
};

type MidiaFormState = {
  id: string;
  url: string;
  tipo: number;
  alt: string;
  destaque: boolean;
  ordem: number;
};

const tiposMidia = [
  { value: 1, label: "Capa" },
  { value: 2, label: "Galeria" },
  { value: 3, label: "Video" },
] as const;

function toDateTimeLocalValue(dateIso: string) {
  const date = new Date(dateIso);
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createEmptyForm(): EventoFormState {
  return {
    titulo: "",
    descricao: "",
    dataHoraInicio: "",
    dataHoraFim: "",
    local: "",
    capacidade: 50,
    preco: 0,
    midias: [],
  };
}

function createEmptyFilters(): FiltroFormState {
  return {
    busca: "",
    local: "",
    dataInicio: "",
    dataFim: "",
  };
}

function mapEventoToForm(evento: Evento): EventoFormState {
  return {
    titulo: evento.titulo,
    descricao: evento.descricao,
    dataHoraInicio: toDateTimeLocalValue(evento.dataHoraInicio),
    dataHoraFim: toDateTimeLocalValue(evento.dataHoraFim),
    local: evento.local,
    capacidade: evento.capacidade,
    preco: evento.preco,
    midias: evento.midias.map((midia, index) => ({
      id: midia.id,
      url: midia.url,
      tipo: midia.tipo,
      alt: midia.alt ?? "",
      destaque: midia.destaque,
      ordem: midia.ordem || index + 1,
    })),
  };
}

export function AdminDashboard() {
  const [usuario] = useState<UsuarioAutenticado | null>(() => obterSessao()?.usuario ?? null);
  const [resultado, setResultado] = useState<PagedResult<Evento> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [eventoEmEdicaoId, setEventoEmEdicaoId] = useState<string | null>(null);
  const [eventoPendenteExclusaoId, setEventoPendenteExclusaoId] = useState<string | null>(null);
  const [carregando, startLoadingTransition] = useTransition();
  const [salvando, startSavingTransition] = useTransition();
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [form, setForm] = useState<EventoFormState>(createEmptyForm);
  const [filtros, setFiltros] = useState<FiltroFormState>(createEmptyFilters);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const eventos = resultado?.items ?? [];

  function adicionarMidia() {
    setForm((current) => ({
      ...current,
      midias: [
        ...current.midias,
        {
          id: crypto.randomUUID(),
          url: "",
          tipo: 2,
          alt: "",
          destaque: current.midias.length === 0,
          ordem: current.midias.length + 1,
        },
      ],
    }));
  }

  function atualizarMidia(id: string, changes: Partial<MidiaFormState>) {
    setForm((current) => ({
      ...current,
      midias: current.midias.map((midia) => (midia.id === id ? { ...midia, ...changes } : midia)),
    }));
  }

  function removerMidia(id: string) {
    setForm((current) => ({
      ...current,
      midias: current.midias
        .filter((midia) => midia.id !== id)
        .map((midia, index) => ({
          ...midia,
          ordem: index + 1,
        })),
    }));
  }

  function carregarEventos(params: ListarEventosAdminParams = {}) {
    startLoadingTransition(async () => {
      if (!usuario) {
        return;
      }

      try {
        const proximaPagina = params.page ?? paginaAtual;
        const resultadoApi = await listarEventosAdmin({
          busca: params.busca ?? filtros.busca,
          local: params.local ?? filtros.local,
          dataInicio: params.dataInicio ?? filtros.dataInicio,
          dataFim: params.dataFim ?? filtros.dataFim,
          page: proximaPagina,
          pageSize: 20,
        });

        setResultado(resultadoApi);
        setPaginaAtual(resultadoApi.page);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel carregar os eventos.");
      }
    });
  }

  useEffect(() => {
    carregarEventos({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  async function handleSubmit(formData: FormData) {
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
        const payload = {
          titulo,
          descricao,
          dataHoraInicio: new Date(dataHoraInicio).toISOString(),
          dataHoraFim: new Date(dataHoraFim).toISOString(),
          local,
          capacidade,
          preco,
          midias: form.midias.map((midia, index) => ({
            url: midia.url.trim(),
            tipo: midia.tipo,
            alt: midia.alt.trim() || null,
            destaque: midia.destaque,
            ordem: midia.ordem || index + 1,
          })),
        };

        if (eventoEmEdicaoId) {
          const eventoAtualizado = await atualizarEvento(eventoEmEdicaoId, payload);
          setResultado((current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((evento) => (evento.id === eventoEmEdicaoId ? eventoAtualizado : evento)),
                }
              : current,
          );
          setFeedback("Evento atualizado com sucesso.");
        } else {
          const novoEvento = await criarEvento(payload);
          setResultado((current) =>
            current
              ? {
                  ...current,
                  items: [novoEvento, ...current.items].slice(0, current.pageSize),
                  totalItems: current.totalItems + 1,
                  totalPages: Math.ceil((current.totalItems + 1) / current.pageSize),
                }
              : current,
          );
          setFeedback("Evento criado com sucesso.");
        }

        setEventoEmEdicaoId(null);
        setForm(createEmptyForm());
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel salvar o evento.");
      }
    });
  }

  function handleEdit(evento: Evento) {
    setErro(null);
    setFeedback(null);
    setEventoEmEdicaoId(evento.id);
    setForm(mapEventoToForm(evento));
  }

  function handleCancelEdit() {
    setErro(null);
    setFeedback(null);
    setEventoEmEdicaoId(null);
    setForm(createEmptyForm());
  }

  function handleDelete(id: string) {
    setErro(null);
    setFeedback(null);
    setExcluindoId(id);

    startLoadingTransition(async () => {
      try {
        await excluirEvento(id);
        setResultado((current) =>
          current
            ? {
                ...current,
                items: current.items.filter((evento) => evento.id !== id),
                totalItems: Math.max(current.totalItems - 1, 0),
                totalPages: Math.max(Math.ceil((current.totalItems - 1) / current.pageSize), 0),
              }
            : current,
        );
        setFeedback("Evento removido com sucesso.");
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Nao foi possivel excluir o evento.");
      } finally {
        setExcluindoId(null);
      }
    });
  }

  function handleAskDelete(id: string) {
    setErro(null);
    setFeedback(null);
    setEventoPendenteExclusaoId(id);
  }

  function handleCancelDelete() {
    setEventoPendenteExclusaoId(null);
  }

  function handleFiltrar(formData: FormData) {
    const proximosFiltros = {
      busca: String(formData.get("busca") ?? ""),
      local: String(formData.get("local") ?? ""),
      dataInicio: String(formData.get("dataInicio") ?? ""),
      dataFim: String(formData.get("dataFim") ?? ""),
    };

    setErro(null);
    setFeedback(null);
    setFiltros(proximosFiltros);
    carregarEventos({ ...proximosFiltros, page: 1 });
  }

  function handleLimparFiltros() {
    const vazios = createEmptyFilters();
    setErro(null);
    setFeedback(null);
    setFiltros(vazios);
    carregarEventos({ ...vazios, page: 1 });
  }

  function handleTrocarPagina(page: number) {
    setErro(null);
    setFeedback(null);
    carregarEventos({ page });
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
              Sessao autenticada como <strong>{usuario.nome}</strong>. Aqui ja usamos o JWT salvo no login para criar,
              editar e remover eventos no backend.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-stone-950 p-6 text-stone-50">
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Status</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-300">
              <p>{usuario.email}</p>
              <p>Papel: {usuario.papel}</p>
              <p>{carregando ? "Sincronizando eventos..." : `${resultado?.totalItems ?? 0} evento(s) encontrado(s)`}</p>
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-stone-950"
            >
              Voltar para vitrine
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Consulta</p>
              <h2 className="font-heading text-4xl uppercase leading-none text-stone-950">Busca e filtros</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-600">
              Refine a lista por texto, local e periodo usando os filtros nativos da API.
            </p>
          </div>

          <form action={handleFiltrar} className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr_180px_180px_auto]">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Busca</span>
              <input
                name="busca"
                value={filtros.busca}
                onChange={(event) => setFiltros((current) => ({ ...current, busca: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                placeholder="Titulo ou descricao"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Local</span>
              <input
                name="local"
                value={filtros.local}
                onChange={(event) => setFiltros((current) => ({ ...current, local: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                placeholder="Cidade ou espaco"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">De</span>
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={(event) => setFiltros((current) => ({ ...current, dataInicio: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Ate</span>
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={(event) => setFiltros((current) => ({ ...current, dataFim: event.target.value }))}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
              />
            </label>

            <div className="flex flex-wrap items-end gap-3">
              <button
                type="submit"
                disabled={carregando}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                Filtrar
              </button>
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
              >
                Limpar
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              {eventoEmEdicaoId ? "Edicao de evento" : "Novo evento"}
            </p>
            <h2 className="mt-3 font-heading text-4xl uppercase leading-none text-stone-950">
              {eventoEmEdicaoId ? "Atualizar cadastro" : "Cadastro rapido"}
            </h2>

            <form action={handleSubmit} className="mt-6 space-y-4">
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

              <div className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Midias</p>
                    <p className="text-sm text-stone-600">Adicione capa, galeria ou video ao evento.</p>
                  </div>
                  <button
                    type="button"
                    onClick={adicionarMidia}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                  >
                    Adicionar midia
                  </button>
                </div>

                {form.midias.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-600">
                    Nenhuma midia adicionada ainda.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.midias.map((midia) => (
                      <div key={midia.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                        <div className="grid gap-4 lg:grid-cols-[1.5fr_180px_1fr_120px_auto]">
                          <label className="block">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                              URL
                            </span>
                            <input
                              value={midia.url}
                              onChange={(event) => atualizarMidia(midia.id, { url: event.target.value })}
                              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                              placeholder="https://..."
                              required
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                              Tipo
                            </span>
                            <select
                              value={midia.tipo}
                              onChange={(event) => atualizarMidia(midia.id, { tipo: Number(event.target.value) })}
                              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                            >
                              {tiposMidia.map((tipo) => (
                                <option key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                              Alt
                            </span>
                            <input
                              value={midia.alt}
                              onChange={(event) => atualizarMidia(midia.id, { alt: event.target.value })}
                              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                              placeholder="Descricao curta"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                              Ordem
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={midia.ordem}
                              onChange={(event) => atualizarMidia(midia.id, { ordem: Number(event.target.value) })}
                              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                            />
                          </label>

                          <div className="flex flex-wrap items-end gap-3">
                            <label className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-3 text-sm text-stone-700">
                              <input
                                type="checkbox"
                                checked={midia.destaque}
                                onChange={(event) => atualizarMidia(midia.id, { destaque: event.target.checked })}
                              />
                              Destaque
                            </label>
                            <button
                              type="button"
                              onClick={() => removerMidia(midia.id)}
                              className="rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {erro ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
              ) : null}

              {feedback ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {salvando ? "Salvando..." : eventoEmEdicaoId ? "Salvar alteracoes" : "Criar evento"}
                </button>

                {eventoEmEdicaoId ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Acervo</p>
                <h2 className="font-heading text-4xl uppercase leading-none text-stone-950">Eventos atuais</h2>
              </div>
              {resultado && resultado.totalPages > 1 ? (
                <p className="text-sm text-stone-600">
                  Pagina {resultado.page} de {resultado.totalPages}
                </p>
              ) : null}
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

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(evento)}
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                        >
                          Editar
                        </button>
                        {eventoPendenteExclusaoId === evento.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(evento.id)}
                              disabled={excluindoId === evento.id}
                              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {excluindoId === evento.id ? "Excluindo..." : "Confirmar"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAskDelete(evento.id)}
                            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {resultado && resultado.totalPages > 1 ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleTrocarPagina(paginaAtual - 1)}
                  disabled={carregando || paginaAtual <= 1}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => handleTrocarPagina(paginaAtual + 1)}
                  disabled={carregando || paginaAtual >= resultado.totalPages}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proxima
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
