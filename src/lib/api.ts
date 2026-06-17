const BASE = "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  posts: {
    list: () => request<any[]>("/api/posts"),
    create: (data: any) => request<any>("/api/posts", { method: "POST", body: JSON.stringify(data) }),
  },
  likes: {
    toggle: (postId: string) => request<{ liked: boolean }>("/api/likes", { method: "POST", body: JSON.stringify({ postId }) }),
  },
  comments: {
    create: (postId: string, content: string) => request<any>("/api/comments", { method: "POST", body: JSON.stringify({ postId, content }) }),
  },
  chat: {
    list: () => request<any[]>("/api/chat"),
    send: (data: { content: string; receiverId?: string; chatRoomId?: string }) => request<any>("/api/chat", { method: "POST", body: JSON.stringify(data) }),
  },
  admin: {
    stats: () => request<any>("/api/admin"),
    action: (action: string, data: any) => request<any>("/api/admin", { method: "POST", body: JSON.stringify({ action, data }) }),
  },
  notifications: {
    list: () => request<any[]>("/api/notifications"),
    markRead: (id: string) => request<any>("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) }),
  },
  budget: {
    list: () => request<{ entries: any[]; goals: any[] }>("/api/budget"),
    create: (data: any) => request<any>("/api/budget", { method: "POST", body: JSON.stringify(data) }),
  },
  polls: {
    list: () => request<any[]>("/api/polls"),
    create: (data: any) => request<any>("/api/polls", { method: "POST", body: JSON.stringify(data) }),
    vote: (pollId: string, option: string) => request<any>("/api/polls/vote", { method: "POST", body: JSON.stringify({ pollId, option }) }),
  },
  archive: {
    list: () => request<any[]>("/api/archive"),
    create: (data: any) => request<any>("/api/archive", { method: "POST", body: JSON.stringify(data) }),
  },
  calendar: {
    list: () => request<any[]>("/api/events"),
    create: (data: any) => request<any>("/api/events", { method: "POST", body: JSON.stringify(data) }),
  },
  capsules: {
    list: () => request<any[]>("/api/capsules"),
    create: (data: any) => request<any>("/api/capsules", { method: "POST", body: JSON.stringify(data) }),
  },
  profile: {
    get: () => request<any>("/api/profile"),
    update: (data: any) => request<any>("/api/profile", { method: "PATCH", body: JSON.stringify(data) }),
  },
  family: {
    list: () => request<{ members: any[]; users: any[] }>("/api/family"),
    create: (data: any) => request<any>("/api/family", { method: "POST", body: JSON.stringify(data) }),
  },
  members: {
    list: () => request<any[]>("/api/members"),
  },
  memories: {
    list: () => request<any[]>("/api/memories"),
    create: (data: any) => request<any>("/api/memories", { method: "POST", body: JSON.stringify(data) }),
  },
  search: {
    query: (q: string) => request<any>(`/api/search?q=${encodeURIComponent(q)}`),
  },
  upload: {
    file: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  },
};
