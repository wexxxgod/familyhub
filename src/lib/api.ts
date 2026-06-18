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
    update: (id: string, data: any) => request<any>("/api/posts", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
    delete: (id: string) => request<any>("/api/posts", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  likes: {
    toggle: (postId: string) => request<{ liked: boolean }>("/api/likes", { method: "POST", body: JSON.stringify({ postId }) }),
  },
  comments: {
    create: (postId: string, content: string) => request<any>("/api/comments", { method: "POST", body: JSON.stringify({ postId, content }) }),
    delete: (id: string) => request<any>("/api/comments", { method: "DELETE", body: JSON.stringify({ id }) }),
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
  polls: {
    list: () => request<any[]>("/api/polls"),
    create: (data: any) => request<any>("/api/polls", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>("/api/polls", { method: "DELETE", body: JSON.stringify({ id }) }),
    vote: (pollId: string, option: string) => request<any>("/api/polls/vote", { method: "POST", body: JSON.stringify({ pollId, option }) }),
  },
  archive: {
    list: () => request<any[]>("/api/archive"),
    create: (data: any) => request<any>("/api/archive", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>("/api/archive", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  calendar: {
    list: () => request<any[]>("/api/events"),
    create: (data: any) => request<any>("/api/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>("/api/events", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
    delete: (id: string) => request<any>("/api/events", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  auth: {
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean }>("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
    changeEmail: (newEmail: string, password: string) =>
      request<{ user: any }>("/api/auth/change-email", { method: "POST", body: JSON.stringify({ newEmail, password }) }),
  },
  profile: {
    get: () => request<any>("/api/profile"),
    update: (data: any) => request<any>("/api/profile", { method: "PATCH", body: JSON.stringify(data) }),
  },
  family: {
    info: () => request<{ family: any; members: any[]; isCreator: boolean }>("/api/family"),
    create: (data: { name: string }) => request<{ family: any; inviteCode: string }>("/api/family", { method: "POST", body: JSON.stringify(data) }),
    join: (data: { inviteCode: string }) => request<{ family: any }>("/api/family/join", { method: "POST", body: JSON.stringify(data) }),
    regenerateCode: () => request<{ inviteCode: string }>("/api/family", { method: "PATCH" }),
    removeMember: (userId: string) => request<any>("/api/family", { method: "DELETE", body: JSON.stringify({ userId }) }),
    leave: () => request<{ success: boolean }>("/api/family/leave", { method: "POST" }),
  },
  familyTree: {
    list: () => request<any[]>("/api/family-tree"),
    create: (data: any) => request<any>("/api/family-tree", { method: "POST", body: JSON.stringify(data) }),
  },
  pets: {
    list: () => request<any[]>("/api/pets"),
    create: (data: any) => request<any>("/api/pets", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>("/api/pets", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  members: {
    list: () => request<any[]>("/api/members"),
  },
  memories: {
    list: () => request<any[]>("/api/memories"),
    create: (data: any) => request<any>("/api/memories", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<any>("/api/memories", { method: "DELETE", body: JSON.stringify({ id }) }),
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
