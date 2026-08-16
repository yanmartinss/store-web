import { create } from "zustand";

interface AuthStore {
  // null = not checked yet
  authenticated: boolean | null;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: null,
  setAuthenticated: (value) => set({ authenticated: value }),
}));
