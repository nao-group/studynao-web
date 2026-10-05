import { create } from "zustand";

type AuthUser = { user_id: string; full_name: string; email: string; avatar_url?: string | null };
type State = { accessToken: string | null; user: AuthUser | null; setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void; setToken: (token: string) => void; setAvatar: (avatarUrl: string) => void; clear: () => void };
export const useAuth = create<State>((set) => ({
  accessToken: null, user: null,
  setSession: (accessToken, refreshToken, user) => { localStorage.setItem("studynao-refresh-token", refreshToken); set({ accessToken, user }); },
  setToken: (accessToken) => set({ accessToken }),
  setAvatar: (avatarUrl) => set((state) => ({ user: state.user ? { ...state.user, avatar_url: avatarUrl } : null })),
  clear: () => { localStorage.removeItem("studynao-refresh-token"); set({ accessToken: null, user: null }); },
}));
