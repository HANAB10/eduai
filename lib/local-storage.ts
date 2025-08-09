
// 本地存储用户管理
export const localUserService = {
  createUser(userData: any) {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const newUser = { ...userData, id: Date.now().toString() }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    return newUser
  },

  getUserByEmail(email: string) {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    return users.find((user: any) => user.email === email)
  },

  setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null')
  }
}
