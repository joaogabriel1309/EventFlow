export type MidiaEvento = {
  id: string;
  url: string;
  tipo: number;
  alt?: string | null;
  destaque: boolean;
  ordem: number;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  local: string;
  capacidade: number;
  preco: number;
  midias: MidiaEvento[];
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const defaultApiBaseUrl = "http://localhost:5217";

function getApiBaseUrl() {
  return process.env.EVENTFLOW_API_URL?.trim() || defaultApiBaseUrl;
}

export async function listarEventos() {
  const response = await fetch(`${getApiBaseUrl()}/api/eventos?page=1&pageSize=6`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os eventos.");
  }

  return (await response.json()) as PagedResult<Evento>;
}

export async function obterEvento(id: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/eventos/${id}`, {
    next: { revalidate: 30 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o evento.");
  }

  return (await response.json()) as Evento;
}

export function formatarData(dataIso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dataIso));
}

export function formatarPreco(preco: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}
