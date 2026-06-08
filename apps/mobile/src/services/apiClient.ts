import { getTokens, saveTokens, clearTokens } from './secureStore';

const BASE_URL = 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function onRefreshComplete() {
  pendingRequests.forEach((cb) => cb());
  pendingRequests = [];
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const tokens = await getTokens();
    if (tokens.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    return handleUnauthorized<T>(path, options);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed: ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

async function handleUnauthorized<T>(path: string, options: RequestInit): Promise<T> {
  if (isRefreshing) {
    return new Promise<T>((resolve) => {
      pendingRequests.push(() => {
        resolve(request<T>(path, options));
      });
    });
  }

  isRefreshing = true;
  try {
    const tokens = await getTokens();
    if (!tokens.refreshToken) throw new Error('No refresh token');

    const refreshResult = await request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken: tokens.refreshToken }) },
      true,
    );

    await saveTokens(refreshResult.accessToken, refreshResult.refreshToken);
    onRefreshComplete();
    return request<T>(path, options);
  } catch {
    await clearTokens();
    throw new ApiError('Session expired', 401);
  } finally {
    isRefreshing = false;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
