// Use same-origin by default so Vite proxy can handle CORS in dev; allow override via VITE_API_URL for prod.
const rawUrl = import.meta.env.VITE_API_URL;
const BASE_URL = (rawUrl === '/' ? '' : rawUrl) || '';
const API_VERSION = '/api/v2';

// Token storage
const TOKEN_KEY = 'access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Base request function with OAuth2 Bearer token
export async function apiRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init);
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  // JSON:API requires specific media type
  const jsonApiMediaType = 'application/vnd.api+json';

  const headers: Record<string, string> = {
    'Content-Type': jsonApiMediaType,
    'Accept': jsonApiMediaType,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> || {}),
  };


  const res = await fetch(`${BASE_URL}${API_VERSION}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          errorMessage = json.message || json.error || json.detail || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // Ignore parsing errors
    }

    // Handle 401 Unauthorized - clear token
    if (res.status === 401) {
      clearToken();
    }

    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json') || contentType.includes('application/vnd.api+json')) {
    return res.json();
  }
  return res.text() as unknown as T;
}

// ============================================
// Authentication
// ============================================

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const response = await request<{ access_token: string; token_type: string; expires_in: number }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.access_token) {
    setToken(response.access_token);
  }

  return response;
}

export async function logout(): Promise<void> {
  try {
    await request('/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function me(): Promise<any> {
  return request('/me', { method: 'GET' });
}

// ============================================
// Items (Content/Posts)
// ============================================

export async function listItems(params?: { include?: string; filter?: Record<string, string>; sort?: string }) {
  let query = '';
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.include) searchParams.set('include', params.include);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        searchParams.set(`filter[${key}]`, value);
      });
    }
    query = '?' + searchParams.toString();
  }
  return request(`/items${query}`, { method: 'GET' });
}

export async function getItem(id: string | number, include?: string) {
  const query = include ? `?include=${include}` : '';
  return request(`/items/${id}${query}`, { method: 'GET' });
}

export async function createItem(data: any) {
  return request('/items', {
    method: 'POST',
    body: JSON.stringify({ data: { type: 'items', attributes: data } }),
  });
}

export async function updateItem(id: string | number, data: any) {
  return request(`/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { type: 'items', id: String(id), attributes: data } }),
  });
}

export async function deleteItem(id: string | number) {
  return request(`/items/${id}`, { method: 'DELETE' });
}

// ============================================
// Categories
// ============================================

export async function listCategories() {
  return request('/categories', { method: 'GET' });
}

export async function createCategory(data: { name: string }) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify({ data: { type: 'categories', attributes: data } }),
  });
}

// ============================================
// Tags
// ============================================

export async function listTags() {
  return request('/tags', { method: 'GET' });
}

export async function createTag(data: { name: string }) {
  return request('/tags', {
    method: 'POST',
    body: JSON.stringify({ data: { type: 'tags', attributes: data } }),
  });
}

// ============================================
// Contact Messages
// ============================================

export async function sendContact(payload: { name: string; email: string; subject?: string; message: string }) {
  return request('/contact', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listContactMessages(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  const query = params.toString() ? '?' + params.toString() : '';
  return request(`/contact-messages${query}`, { method: 'GET' });
}

export async function getContactMessage(id: string | number) {
  return request(`/contact-messages/${id}`, { method: 'GET' });
}

export async function replyContactMessage(id: string | number, replyMessage: string) {
  return request(`/contact-messages/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ reply_message: replyMessage }),
  });
}

export async function updateContactMessageStatus(id: string | number, status: 'new' | 'read' | 'replied' | 'archived') {
  return request(`/contact-messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteContactMessage(id: string | number) {
  return request(`/contact-messages/${id}`, { method: 'DELETE' });
}

// ============================================
// Email Subscriptions
// ============================================

export async function subscribe(email: string, name?: string, source?: string) {
  return request('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email, name, source }),
  });
}

export async function listSubscriptions(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  const query = params.toString() ? '?' + params.toString() : '';
  return request(`/subscriptions${query}`, { method: 'GET' });
}

export async function getSubscription(id: string | number) {
  return request(`/subscriptions/${id}`, { method: 'GET' });
}

export async function updateSubscriptionStatus(id: string | number, status: 'active' | 'unsubscribed') {
  return request(`/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteSubscription(id: string | number) {
  return request(`/subscriptions/${id}`, { method: 'DELETE' });
}

export async function broadcastAnnouncement(subject: string, content: string, actionText?: string, actionUrl?: string) {
  return request('/subscriptions/broadcast', {
    method: 'POST',
    body: JSON.stringify({ subject, content, action_text: actionText, action_url: actionUrl }),
  });
}

// ============================================
// Site Settings
// ============================================

export async function getSettings(group?: string) {
  const query = group ? `?group=${group}` : '';
  return request(`/settings${query}`, { method: 'GET' });
}

export async function updateSettings(settings: Array<{ key: string; value: any; group?: string }>) {
  return request('/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

export async function getSetting(key: string) {
  return request(`/settings/${key}`, { method: 'GET' });
}

export async function deleteSetting(key: string) {
  return request(`/settings/${key}`, { method: 'DELETE' });
}

// ============================================
// Users (Admin)
// ============================================

export async function listUsers() {
  return request('/users', { method: 'GET' });
}

export async function getUser(id: string | number) {
  return request(`/users/${id}`, { method: 'GET' });
}

export async function createUser(data: any) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ data: { type: 'users', attributes: data } }),
  });
}

export async function updateUser(id: string | number, data: any) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { type: 'users', id: String(id), attributes: data } }),
  });
}

export async function deleteUser(id: string | number) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

// ============================================
// File Uploads
// ============================================

export async function uploadFile(resource: string, id: string | number, field: string, file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append('attachment', file);

  const res = await fetch(`${BASE_URL}${API_VERSION}/uploads/${resource}/${id}/${field}`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return res.json();
}

// ============================================
// Media (Legacy - kept for MediaPicker compatibility)
// ============================================

export async function listMedia(type?: string) {
  // The new CMS doesn't have a separate media endpoint
  // Return empty array for now - media is handled per-item
  console.warn('listMedia is deprecated - media is now handled per-item');
  return { data: [] };
}

export async function uploadMedia(file: File, altText?: string) {
  const token = getToken();
  const formData = new FormData();
  formData.append('attachment', file);
  if (altText) {
    formData.append('alt_text', altText);
  }

  // Use the generic upload endpoint
  const res = await fetch(`${BASE_URL}${API_VERSION}/uploads/items/0/image`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteMedia(id: string | number) {
  console.warn('deleteMedia is deprecated - media is now handled per-item');
  return null;
}

// ============================================
// Legacy compatibility - to be removed after refactoring
// ============================================

// These are temporary aliases for backward compatibility
export const listPosts = listItems;
export const getPost = getItem;
export const createPost = createItem;
export const updatePostApi = updateItem;
export const deletePostApi = deleteItem;
export const updateUserApi = updateUser;
export const deleteUserApi = deleteUser;

