const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
let csrfToken;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details || [];
  }

  fieldError(field) {
    return this.details?.find((detail) => detail.field === field)?.message || '';
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const isForm = body instanceof FormData;
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const needsCsrf = isMutating && path.startsWith('/admin/');

  if (needsCsrf && !csrfToken) {
    const csrfResponse = await request('/csrf');
    csrfToken = csrfResponse?.csrfToken;
  }

  let response;
  try {
    const headers = isForm || body === undefined ? {} : { 'Content-Type': 'application/json' };
    if (needsCsrf && csrfToken) headers['X-CSRF-Token'] = csrfToken;
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: Object.keys(headers).length ? headers : undefined,
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 200) };
    }
  }

  if (!response.ok) {
    if (response.status === 403 && needsCsrf) csrfToken = undefined;
    if (response.status === 401 && path.startsWith('/admin/')) {
      window.dispatchEvent(new Event('admin:unauthorized'));
    }
    throw new ApiError(
      data?.error || `Request failed (${response.status})`,
      response.status,
      data?.details
    );
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (file, kind = 'image') => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('file', file);
    return request('/admin/uploads', { method: 'POST', body: form });
  }
};

export function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function mediaUrl(url) {
  if (!url) return '';
  return url;
}
