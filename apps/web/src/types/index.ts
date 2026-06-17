export interface User { id: string; username: string; email?: string; role?: 'user' | 'admin'; createdAt?: string }
export interface Product { id: string; name: string; price: number; description?: string; stock?: number; category?: string }
export interface CartItem { productId: string; quantity: number; price?: number }
export interface Cart { items: CartItem[]; total: number }
export interface Order { id: string; userId: string; total: number; status: string; createdAt?: string; items: any[] }
