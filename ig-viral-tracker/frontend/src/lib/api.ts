const API_BASE = "/api/v1";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  createUser: (data: { email: string; name: string; niche?: string; tone_of_voice?: string }) =>
    fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),

  getUser: (userId: string) => fetchAPI(`/users/${userId}`),

  listAccounts: (userId: string) => fetchAPI<any[]>(`/users/${userId}/accounts`),

  addAccount: (userId: string, data: { ig_username: string; niche_tags?: string[] }) =>
    fetchAPI(`/users/${userId}/accounts`, { method: "POST", body: JSON.stringify(data) }),

  deleteAccount: (userId: string, accountId: string) =>
    fetchAPI(`/users/${userId}/accounts/${accountId}`, { method: "DELETE" }),

  triggerScan: (userId: string, accountId: string) =>
    fetchAPI(`/users/${userId}/accounts/${accountId}/scan`, { method: "POST" }),

  listVirals: (userId: string, limit = 50) =>
    fetchAPI<any[]>(`/users/${userId}/virals?limit=${limit}`),

  getViral: (viralId: string) => fetchAPI<any>(`/virals/${viralId}`),

  createRecreation: (userId: string, data: { viral_post_id: string; desired_format?: string }) =>
    fetchAPI(`/users/${userId}/recreations`, { method: "POST", body: JSON.stringify(data) }),

  listRecreations: (userId: string) => fetchAPI<any[]>(`/users/${userId}/recreations`),

  getDashboard: (userId: string) => fetchAPI<any>(`/users/${userId}/dashboard`),
};
