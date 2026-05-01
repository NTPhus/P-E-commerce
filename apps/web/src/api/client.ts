import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = '' // relative proxy will be used in dev
export const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } })

export default apiClient
