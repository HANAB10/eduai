"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from 'lucide-react'

export default function StaffRegisterPage() {
  const router = useRouter()

  const handleRegister = async (formData: FormData) => {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      staffId: formData.get("staffId") as string
    }

    try {
      const response = await fetch('/api/auth/register/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('教师账户注册成功！请登录')
        router.push("/")
      } else {
        alert(result.error || '注册失败')
      }
    } catch (error) {
      console.error('注册错误:', error)
      alert('网络错误，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg border border-edu-light bg-white">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Staff Registration
          </CardTitle>
          <CardDescription className="text-gray-600">Create your staff account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  type="text" 
                  placeholder="Dr. Jane"
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
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName"
                  type="text" 
                  placeholder="Doe"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffId" className="text-gray-700 font-medium">Staff ID</Label>
              <Input 
                id="staffId" 
                name="staffId"
                type="text" 
                placeholder="e.g., STAFF001234"
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
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="jane.doe@university.edu"
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
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="Create a strong password"
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
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                placeholder="Confirm your password"
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
              Create Staff Account
            </Button>
          </form>

          <div className="text-center mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/" className="hover:underline font-medium transition-colors duration-300" style={{ color: '#94ABF5' }}>
                Sign in here
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              Are you a student?{" "}
              <Link href="/studentregister" className="hover:underline font-medium transition-colors duration-300" style={{ color: '#94ABF5' }}>
                Student Registration
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}