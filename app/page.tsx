
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users } from 'lucide-react'
import Link from "next/link"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()

  const handleLogin = async (userType: string, formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 登录成功，保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 根据用户类型跳转到不同页面
        if (userType === "student") {
          router.push("/student")
        } else {
          router.push("/staff")
        }
      } else {
        // 登录失败，显示错误信息
        alert(data.error || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      alert('网络错误，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border border-edu-light bg-white">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Edu AI
          </CardTitle>
          <CardDescription className="text-gray-600">Access your academic account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50">
              <TabsTrigger 
                value="student" 
                className="flex items-center gap-2 data-[state=active]:text-gray-800 transition-all duration-300 border"
                style={{ 
                  backgroundColor: activeTab === 'student' ? '#EFF4FF' : undefined,
                  borderColor: activeTab === 'student' ? '#E5E7EB' : 'transparent'
                }}
              >
                <GraduationCap className="h-4 w-4" />
                Student Login
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="flex items-center gap-2 data-[state=active]:text-gray-800 transition-all duration-300 border"
                style={{ 
                  backgroundColor: activeTab === 'staff' ? '#EFF4FF' : undefined,
                  borderColor: activeTab === 'staff' ? '#E5E7EB' : 'transparent'
                }}
              >
                <Users className="h-4 w-4" />
                Staff Login
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="space-y-4 mt-6">
              <form action={(formData) => handleLogin("student", formData)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email" className="text-gray-700 font-medium">Student ID / Email</Label>
                  <Input 
                    id="student-email" 
                    name="email"
                    type="email" 
                    placeholder="Enter your student ID or email"
                    className="border-gray-200 bg-white transition-all duration-300"
                    style={{ 
                      '--tw-ring-color': '#EFF4FF',
                      borderColor: 'var(--focus-border, #e5e7eb)'
                    }}
                    onFocus={(e) => e.target.style.setProperty('--focus-border', '#EFF4FF')}
                    onBlur={(e) => e.target.style.setProperty('--focus-border', '#e5e7eb')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password" className="text-gray-700 font-medium">Password</Label>
                  <Input 
                    id="student-password" 
                    name="password"
                    type="password" 
                    placeholder="Enter your password"
                    className="border-gray-200 bg-white transition-all duration-300"
                    style={{ 
                      '--tw-ring-color': '#EFF4FF',
                      borderColor: 'var(--focus-border, #e5e7eb)'
                    }}
                    onFocus={(e) => e.target.style.setProperty('--focus-border', '#EFF4FF')}
                    onBlur={(e) => e.target.style.setProperty('--focus-border', '#e5e7eb')}
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-gray-800 transition-all duration-300 font-medium border"
                  style={{ 
                    backgroundColor: '#EFF4FF',
                    borderColor: '#E5E7EB'
                  }}
                >
                  Student Login
                </Button>
              </form>
              <div className="text-center space-y-2">
                <Link href="/forgot-password?type=student" className="text-sm hover:underline transition-colors duration-300" style={{ color: '#94ABF5' }}>
                  Forgot password?
                </Link>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/studentregister" className="hover:underline font-medium transition-colors duration-300" style={{ color: '#94ABF5' }}>
                    Student Registration
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="staff" className="space-y-4 mt-6">
              <form action={(formData) => handleLogin("staff", formData)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email" className="text-gray-700 font-medium">Staff ID / Email</Label>
                  <Input 
                    id="staff-email" 
                    name="email"
                    type="email" 
                    placeholder="Enter your staff ID or email"
                    className="border-gray-200 bg-white transition-all duration-300"
                    style={{ 
                      '--tw-ring-color': '#EFF4FF',
                      borderColor: 'var(--focus-border, #e5e7eb)'
                    }}
                    onFocus={(e) => e.target.style.setProperty('--focus-border', '#EFF4FF')}
                    onBlur={(e) => e.target.style.setProperty('--focus-border', '#e5e7eb')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password" className="text-gray-700 font-medium">Password</Label>
                  <Input 
                    id="staff-password" 
                    name="password"
                    type="password" 
                    placeholder="Enter your password"
                    className="border-gray-200 bg-white transition-all duration-300"
                    style={{ 
                      '--tw-ring-color': '#EFF4FF',
                      borderColor: 'var(--focus-border, #e5e7eb)'
                    }}
                    onFocus={(e) => e.target.style.setProperty('--focus-border', '#EFF4FF')}
                    onBlur={(e) => e.target.style.setProperty('--focus-border', '#e5e7eb')}
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-gray-800 transition-all duration-300 font-medium border"
                  style={{ 
                    backgroundColor: '#EFF4FF',
                    borderColor: '#E5E7EB'
                  }}
                >
                  Staff Login
                </Button>
              </form>
              <div className="text-center space-y-2">
                <Link href="/forgot-password?type=staff" className="text-sm hover:underline transition-colors duration-300" style={{ color: '#94ABF5' }}>
                  Forgot password?
                </Link>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/staffregister" className="hover:underline font-medium transition-colors duration-300" style={{ color: '#94ABF5' }}>
                    Staff Registration
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
