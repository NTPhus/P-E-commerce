import apiClient from './client'
import type { LoginResponse } from '@/types'

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/login', { username, password })
    return res.data
  }
}
