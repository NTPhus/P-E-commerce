import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    // Lightweight local login for frontend MVP (no real auth server here)
    const user: User = { id: 'local-' + username, username, role: 'user', createdAt: new Date().toISOString() }
    set({ user, token: 'local-token', isAuthenticated: true })
  },
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}))
