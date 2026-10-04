import { create } from "zustand";

type AuthUser = { user_id: string; full_name: string; email: string };
type State = { accessToken: string | null; user: AuthUser | null; setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void; setToken: (token: string) => void; clear: () => void };
export const useAuth = create<State>((set) => ({
  accessToken: null, user: null,
  setSession: (accessToken, refreshToken, user) => { localStorage.setItem("studynao-refresh-token", refreshToken); set({ accessToken, user }); },
  setToken: (accessToken) => set({ accessToken }),
  clear: () => { localStorage.removeItem("studynao-refresh-token"); set({ accessToken: null, user: null }); },
}));
