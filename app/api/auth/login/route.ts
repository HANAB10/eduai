
import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // 根据邮箱查找用户
    const user = await userService.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    // 验证用户类型
    if (user.user_type !== userType) {
      return NextResponse.json(
        { error: '用户类型不匹配' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 登录成功，返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
