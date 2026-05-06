import { obterAccessToken } from "@/lib/auth";
import type { Evento, PagedResult } from "@/lib/eventos";

export type CriarEventoPayload = {
  titulo: string;
  descricao: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  local: string;
  capacidade: number;
  preco: number;
  midias: [];
};

export type ListarEventosAdminParams = {
  busca?: string;
  local?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
};

const defaultApiBaseUrl = "http://localhost:5217";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_EVENTFLOW_API_URL?.trim() || process.env.EVENTFLOW_API_URL?.trim() || defaultApiBaseUrl;
}

function getAuthHeaders() {
  const token = obterAccessToken();

  if (!token) {
    throw new Error("Faca login para acessar a area administrativa.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarEventosAdmin(params: ListarEventosAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.busca?.trim()) {
    searchParams.set("busca", params.busca.trim());
  }

  if (params.local?.trim()) {
    searchParams.set("local", params.local.trim());
  }

  if (params.dataInicio?.trim()) {
    searchParams.set("dataInicio", new Date(params.dataInicio).toISOString());
  }

  if (params.dataFim?.trim()) {
    searchParams.set("dataFim", new Date(params.dataFim).toISOString());
  }

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  const response = await fetch(`${getApiBaseUrl()}/api/eventos?${searchParams.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os eventos.");
  }

  return (await response.json()) as PagedResult<Evento>;
}

export async function criarEvento(payload: CriarEventoPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/eventos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Nao foi possivel criar o evento.";

    try {
      const data = (await response.json()) as { errors?: Record<string, string[]> };
      const errors = data.errors ? Object.values(data.errors).flat() : [];

      if (errors.length > 0) {
        message = errors[0];
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as Evento;
}

export async function excluirEvento(id: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/eventos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel excluir o evento.");
  }
}

export async function atualizarEvento(id: string, payload: CriarEventoPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/eventos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Nao foi possivel atualizar o evento.";

    try {
      const data = (await response.json()) as { errors?: Record<string, string[]> };
      const errors = data.errors ? Object.values(data.errors).flat() : [];

      if (errors.length > 0) {
        message = errors[0];
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as Evento;
}

export async function uploadMidia(file: File) {
  const token = obterAccessToken();

  if (!token) {
    throw new Error("Faca login para enviar arquivos.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/api/uploads/midia`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Nao foi possivel enviar o arquivo.";

    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as {
    fileName: string;
    contentType: string;
    key: string;
    url: string;
  };
}
