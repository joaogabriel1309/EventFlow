"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import {
  getServerSessaoSnapshot,
  limparSessao,
  login,
  obterSessao,
  salvarSessao,
  subscribeSessao,
} from "@/lib/auth";

const credenciaisBootstrap = {
  email: "admin@eventflow.local",
  senha: "Admin123!",
};

export function TopBar() {
  const sessao = useSyncExternalStore(subscribeSessao, obterSessao, getServerSessaoSnapshot);
  const [email, setEmail] = useState(credenciaisBootstrap.email);
  const [senha, setSenha] = useState(credenciaisBootstrap.senha);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const auth = await login(email, senha);
      salvarSessao(auth);
      setAberto(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel realizar o login.");
    } finally {
      setCarregando(false);
    }
  }

  function handleLogout() {
    limparSessao();
    setAberto(false);
  }

  return (
    <header className="z-40 border-b border-white/60 bg-[linear-gradient(180deg,_rgba(255,252,247,0.95)_0%,_rgba(255,249,242,0.86)_100%)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-stone-950 px-3 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white">
            EF
          </div>
          <div>
            <p className="font-heading text-3xl uppercase leading-none text-stone-950">EventFlow</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Plataforma de eventos
            </p>
          </div>
        </Link>

        {sessao ? (
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-emerald-200 bg-white/90 px-4 py-3 shadow-[0_18px_45px_-35px_rgba(17,94,55,0.45)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold uppercase text-emerald-800">
              {sessao.usuario.nome.slice(0, 2)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-stone-950">{sessao.usuario.nome}</p>
              <p className="truncate text-xs uppercase tracking-[0.2em] text-stone-500">{sessao.usuario.papel}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Painel
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setAberto((current) => !current);
                setErro(null);
              }}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Entrar
            </button>

            {aberto ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(92vw,26rem)] rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.35)]">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Area administrativa</p>
                <h3 className="mt-3 font-heading text-4xl uppercase leading-none text-stone-950">Entrar com JWT</h3>
                <p className="mt-4 text-sm leading-7 text-stone-700">
                  Use o admin de desenvolvimento para abrir o painel e testar os fluxos autenticados.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                      placeholder="admin@eventflow.local"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                      Senha
                    </span>
                    <input
                      type="password"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition-colors focus:border-orange-500"
                      placeholder="Admin123!"
                      required
                    />
                  </label>

                  {erro ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {erro}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={carregando}
                    className="w-full rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {carregando ? "Entrando..." : "Entrar com JWT"}
                  </button>
                </form>

                <div className="mt-5 rounded-2xl border border-dashed border-stone-300 px-4 py-3 text-xs leading-6 text-stone-600">
                  Credenciais de desenvolvimento: {credenciaisBootstrap.email} / {credenciaisBootstrap.senha}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
