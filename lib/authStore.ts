import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  isLoggedIn: boolean;
  email: string | null;
  setToken: (token: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setEmail: (email: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isLoggedIn: false,
  email: null,
  setToken: (token) => set({ token }),
  setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  setEmail: (email) => set({ email }),
  logout: () =>
    set({ token: null, isLoggedIn: false, email: null }),
}));
