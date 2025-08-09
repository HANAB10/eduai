
"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  user_type: 'student' | 'staff'
  student_id?: string
  staff_id?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('解析用户数据失败:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const getInitials = () => {
    if (!user) return 'U'
    const firstInitial = user.first_name?.charAt(0).toUpperCase() || ''
    const lastInitial = user.last_name?.charAt(0).toUpperCase() || ''
    return firstInitial + lastInitial
  }

  const getFullName = () => {
    if (!user) return 'Unknown User'
    return `${user.first_name} ${user.last_name}`
  }

  return {
    user,
    loading,
    logout,
    getInitials,
    getFullName
  }
}
