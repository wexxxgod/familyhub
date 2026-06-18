import { create } from "zustand";
import { api } from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface AppState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  searchQuery: string;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  setSearchQuery: (q: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  searchQuery: "",

  fetchNotifications: async () => {
    try {
      const notifications = await api.notifications.list();
      set({
        notifications,
        unreadCount: notifications.filter((n: any) => !n.read).length,
      });
    } catch {
      // silently fail
    }
  },

  markNotificationRead: async (id: string) => {
    await api.notifications.markRead(id);
    get().fetchNotifications();
  },

  markAllRead: async () => {
    try {
      await api.notifications.markRead("all");
      set({ unreadCount: 0, notifications: get().notifications.map((n) => ({ ...n, read: true })) });
    } catch {}
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
