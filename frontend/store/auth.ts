import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUserId: (userId: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userId: null,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setUserId: (userId) => set({ userId }),
}));
