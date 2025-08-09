
import { Pool } from 'pg'

// PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export interface User {
  id: number
  user_type: "student" | "staff"
  first_name: string
  last_name: string
  email: string
  password: string // 在实际应用中应该加密
  student_id?: string
  staff_id?: string
  created_at: Date
  updated_at: Date
}

export const userService = {
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const client = await pool.connect()
    try {
      const query = `
        INSERT INTO users (user_type, first_name, last_name, email, password, student_id, staff_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `
      const values = [
        userData.user_type,
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.student_id || null,
        userData.staff_id || null
      ]
      
      const result = await client.query(query, values)
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await pool.connect()
    try {
      const query = 'SELECT * FROM users WHERE email = $1'
      const result = await client.query(query, [email])
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async getUserById(id: number): Promise<User | null> {
    const client = await pool.connect()
    try {
      const query = 'SELECT * FROM users WHERE id = $1'
      const result = await client.query(query, [id])
      return result.rows[0] || null
    } finally {
      client.release()
    }
  }
}

// 初始化数据库表
export async function initializeDatabase() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'staff')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        student_id VARCHAR(50) UNIQUE,
        staff_id VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('数据库表初始化完成')
  } finally {
    client.release()
  }
}
