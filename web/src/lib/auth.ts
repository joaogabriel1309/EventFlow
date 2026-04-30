export type UsuarioAutenticado = {
  id: string;
  nome: string;
  email: string;
  papel: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresAtUtc: string;
  usuario: UsuarioAutenticado;
};

const defaultApiBaseUrl = "http://localhost:5217";
const authStorageKey = "eventflow.auth";
const authEventName = "eventflow-auth-change";
let cachedSessaoRaw: string | null = null;
let cachedSessao: AuthResponse | null = null;

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_EVENTFLOW_API_URL?.trim() || process.env.EVENTFLOW_API_URL?.trim() || defaultApiBaseUrl;
}

export async function login(email: string, senha: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    let message = "Nao foi possivel realizar o login.";

    try {
      const data = (await response.json()) as { errors?: Record<string, string[]> };
      const errors = data.errors ? Object.values(data.errors).flat() : [];

      if (errors.length > 0) {
        message = errors[0];
      }
    } catch {
      // Keep default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as AuthResponse;
}

export function salvarSessao(auth: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(authStorageKey, JSON.stringify(auth));
  window.dispatchEvent(new Event(authEventName));
}

export function obterSessao() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(authStorageKey);

  if (!stored) {
    cachedSessaoRaw = null;
    cachedSessao = null;
    return null;
  }

  if (stored === cachedSessaoRaw) {
    return cachedSessao;
  }

  try {
    const parsed = JSON.parse(stored) as AuthResponse;
    cachedSessaoRaw = stored;
    cachedSessao = parsed;
    return parsed;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    cachedSessaoRaw = null;
    cachedSessao = null;
    window.dispatchEvent(new Event(authEventName));
    return null;
  }
}

export function limparSessao() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(authStorageKey);
  cachedSessaoRaw = null;
  cachedSessao = null;
  window.dispatchEvent(new Event(authEventName));
}

export function obterAccessToken() {
  return obterSessao()?.accessToken ?? null;
}

export function subscribeSessao(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === authStorageKey) {
      onStoreChange();
    }
  };

  const handleAuthChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(authEventName, handleAuthChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(authEventName, handleAuthChange);
  };
}

export function getServerSessaoSnapshot() {
  return null;
}
