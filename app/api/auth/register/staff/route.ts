
import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, confirmPassword, staffId } = await request.json()

    // 验证密码匹配
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '密码不匹配' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await userService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建新用户
    const newUser = await userService.createUser({
      user_type: 'staff',
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      staff_id: staffId
    })

    // 返回成功响应（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      success: true,
      message: '教师账户创建成功',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('教师注册错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
