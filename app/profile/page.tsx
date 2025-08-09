
"use client"

import { useUser } from "@/hooks/use-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, IdCard } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading, getInitials, getFullName } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={user.user_type === 'student' ? '/student' : '/staff'}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-indigo-200">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{getFullName()}</CardTitle>
            <CardDescription className="text-lg capitalize">
              {user.user_type}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  First Name
                </div>
                <div className="text-gray-900">{user.first_name}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  Last Name
                </div>
                <div className="text-gray-900">{user.last_name}</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <div className="text-gray-900">{user.email}</div>
            </div>

            {/* ID Information */}
            {user.user_type === 'student' && user.student_id && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IdCard className="w-4 h-4" />
                  Student ID
                </div>
                <div className="text-gray-900">{user.student_id}</div>
              </div>
            )}

            {user.user_type === 'staff' && user.staff_id && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IdCard className="w-4 h-4" />
                  Staff ID
                </div>
                <div className="text-gray-900">{user.staff_id}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
