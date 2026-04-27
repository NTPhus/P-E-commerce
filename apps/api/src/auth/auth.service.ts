export class AuthService {
  private users: Array<{ username: string; password: string; email?: string }> = []

  register(username: string, password: string, email?: string) {
    const user = { username, password, email }
    this.users.push(user)
    return { success: true, user }
  }

  login(username: string, password: string) {
    const u = this.users.find(u => u.username === username && u.password === password)
    if (!u) return { success: false, message: 'Invalid credentials' }
    // simple mock token
    return { success: true, token: 'mock-token-' + username }
  }
}
