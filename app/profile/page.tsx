
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Settings, User } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">Username</h2>
                <p className="text-gray-600">student@university.edu</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">Discussions Participated</h3>
                <p className="text-2xl font-bold text-blue-600">15</p>
                <p className="text-sm text-blue-700">discussions</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">Total Speaking Time</h3>
                <p className="text-2xl font-bold text-green-600">2.5</p>
                <p className="text-sm text-green-700">hours</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800">Discussion Quality</h3>
                <p className="text-2xl font-bold text-purple-600">4.2</p>
                <p className="text-sm text-purple-700">average score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Participated in Home Healthcare Management discussion</h4>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Completed Patient Safety exercise</h4>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">Earned Active Participant badge</h4>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
