
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

// 讨论服务
export const discussionService = {
  async createSession(sessionData: {
    session_name: string
    trat_question: string
  }) {
    const client = await pool.connect()
    try {
      const query = `
        INSERT INTO discussion_sessions (session_name, trat_question)
        VALUES ($1, $2)
        RETURNING *
      `
      const result = await client.query(query, [
        sessionData.session_name,
        sessionData.trat_question
      ])
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  async saveDiscussion(discussionData: {
    session_id: number
    user_id: number
    speaker_name: string
    content: string
    quality_score: number
    keywords: string[]
    concepts: string[]
    thought_type: string
    has_evidence: boolean
    has_claim: boolean
    has_reasoning: boolean
    has_counterargument: boolean
  }) {
    const client = await pool.connect()
    try {
      const query = `
        INSERT INTO discussions (
          session_id, user_id, speaker_name, content, quality_score,
          keywords, concepts, thought_type, has_evidence, has_claim,
          has_reasoning, has_counterargument
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `
      const result = await client.query(query, [
        discussionData.session_id,
        discussionData.user_id,
        discussionData.speaker_name,
        discussionData.content,
        discussionData.quality_score,
        discussionData.keywords,
        discussionData.concepts,
        discussionData.thought_type,
        discussionData.has_evidence,
        discussionData.has_claim,
        discussionData.has_reasoning,
        discussionData.has_counterargument
      ])
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  async getSessionHistory(sessionId: number) {
    const client = await pool.connect()
    try {
      const query = `
        SELECT d.*, u.first_name, u.last_name
        FROM discussions d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.session_id = $1
        ORDER BY d.timestamp ASC
      `
      const result = await client.query(query, [sessionId])
      return result.rows
    } finally {
      client.release()
    }
  }
}

// 进度追踪服务
export const progressService = {
  async updateStudentProgress(progressData: {
    user_id: number
    session_id: number
    total_speaking_time: number
    contribution_count: number
    average_quality_score: number
    participation_level: string
  }) {
    const client = await pool.connect()
    try {
      const query = `
        INSERT INTO student_progress (
          user_id, session_id, total_speaking_time, contribution_count,
          average_quality_score, participation_level, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, session_id) DO UPDATE SET
          total_speaking_time = $3,
          contribution_count = $4,
          average_quality_score = $5,
          participation_level = $6,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      const result = await client.query(query, [
        progressData.user_id,
        progressData.session_id,
        progressData.total_speaking_time,
        progressData.contribution_count,
        progressData.average_quality_score,
        progressData.participation_level
      ])
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  async getStudentOverallProgress(userId: number) {
    const client = await pool.connect()
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT session_id) as total_sessions,
          SUM(total_speaking_time) as total_speaking_time,
          SUM(contribution_count) as total_contributions,
          AVG(average_quality_score) as overall_quality
        FROM student_progress
        WHERE user_id = $1
      `
      const result = await client.query(query, [userId])
      return result.rows[0]
    } finally {
      client.release()
    }
  }
}

// 语音特征存储服务
export const voicePrintService = {
  async saveVoicePrint(voicePrint: {
    user_id: string
    features: number[]
    sample_rate: number
    duration: number
    transcript: string
  }) {
    const client = await pool.connect()
    try {
      const query = `
        INSERT INTO voice_prints (user_id, features, sample_rate, duration, transcript)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          features = $2,
          sample_rate = $3,
          duration = $4,
          transcript = $5,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      const result = await client.query(query, [
        voicePrint.user_id,
        JSON.stringify(voicePrint.features),
        voicePrint.sample_rate,
        voicePrint.duration,
        voicePrint.transcript
      ])
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  async getVoicePrint(userId: string) {
    const client = await pool.connect()
    try {
      const query = 'SELECT * FROM voice_prints WHERE user_id = $1'
      const result = await client.query(query, [userId])
      if (result.rows[0]) {
        const row = result.rows[0]
        return {
          ...row,
          features: JSON.parse(row.features)
        }
      }
      return null
    } finally {
      client.release()
    }
  },

  async getAllVoicePrints() {
    const client = await pool.connect()
    try {
      const query = `
        SELECT vp.*, u.first_name, u.last_name 
        FROM voice_prints vp
        LEFT JOIN users u ON vp.user_id::integer = u.id
        ORDER BY vp.created_at DESC
      `
      const result = await client.query(query)
      return result.rows.map(row => ({
        ...row,
        features: JSON.parse(row.features)
      }))
    } finally {
      client.release()
    }
  }
}

// 初始化数据库表
export async function initializeDatabase() {
  const client = await pool.connect()
  try {
    // 用户表
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

    // 讨论会话表
    await client.query(`
      CREATE TABLE IF NOT EXISTS discussion_sessions (
        id SERIAL PRIMARY KEY,
        session_name VARCHAR(200) NOT NULL,
        trat_question TEXT NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        total_duration INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 讨论记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES discussion_sessions(id),
        user_id INTEGER REFERENCES users(id),
        speaker_name VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quality_score INTEGER DEFAULT 0,
        keywords TEXT[],
        concepts TEXT[],
        thought_type VARCHAR(50) DEFAULT 'answer',
        has_evidence BOOLEAN DEFAULT FALSE,
        has_claim BOOLEAN DEFAULT FALSE,
        has_reasoning BOOLEAN DEFAULT FALSE,
        has_counterargument BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 语音特征数据表
    await client.query(`
      CREATE TABLE IF NOT EXISTS voice_prints (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        features TEXT NOT NULL,
        sample_rate INTEGER DEFAULT 16000,
        duration DECIMAL(5,2) DEFAULT 0.0,
        transcript TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 学生参与度统计表
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id INTEGER REFERENCES discussion_sessions(id),
        total_speaking_time INTEGER DEFAULT 0,
        contribution_count INTEGER DEFAULT 0,
        average_quality_score DECIMAL(3,2) DEFAULT 0.0,
        participation_level VARCHAR(20) DEFAULT 'low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('数据库表初始化完成')
  } finally {
    client.release()
  }
}
