
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Settings as SettingsIcon, Save } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Personal Information Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Name</Label>
                  <Input id="firstName" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@university.edu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Medical student focusing on home healthcare management research" />
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Guidance</Label>
                  <p className="text-sm text-gray-600">Allow AI to provide guidance and suggestions during discussions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Smart Resource Recommendations</Label>
                  <p className="text-sm text-gray-600">Automatically recommend relevant resources based on discussion content</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voice Recognition</Label>
                  <p className="text-sm text-gray-600">Enable voice recognition functionality</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Discussion Invitations</Label>
                  <p className="text-sm text-gray-600">Notify me when I receive new discussion invitations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Feedback</Label>
                  <p className="text-sm text-gray-600">Notify me when AI generates discussion feedback</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
