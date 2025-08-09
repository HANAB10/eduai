
"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  MessageCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Upload,
  BarChart3,
  Brain,
  FileText,
  Mic,
  Eye,
  Sparkles,
  Activity,
  Plus,
  X,
  Shuffle,
} from "lucide-react"

// Mock data
const groups = [
  {
    id: 1,
    name: "Group 1",
    members: 4,
    participation: 85,
    contributions: 23,
    duration: "18min",
    status: "active",
    engagement: "high",
    needsAttention: false,
  },
  {
    id: 2,
    name: "Group 2",
    members: 5,
    participation: 45,
    contributions: 8,
    duration: "12min",
    status: "inactive",
    engagement: "low",
    needsAttention: true,
  },
  {
    id: 3,
    name: "Group 3",
    members: 4,
    participation: 72,
    contributions: 18,
    duration: "16min",
    status: "active",
    engagement: "medium",
    needsAttention: false,
  },
  {
    id: 4,
    name: "Group 4",
    members: 3,
    participation: 90,
    contributions: 31,
    duration: "19min",
    status: "active",
    engagement: "high",
    needsAttention: false,
  },
  {
    id: 5,
    name: "Group 5",
    members: 4,
    participation: 25,
    contributions: 3,
    duration: "8min",
    status: "inactive",
    engagement: "low",
    needsAttention: true,
  },
  {
    id: 6,
    name: "Group 6",
    members: 5,
    participation: 68,
    contributions: 15,
    duration: "14min",
    status: "active",
    engagement: "medium",
    needsAttention: false,
  },
]

const alerts = [
  { id: 1, group: "Group 2", message: "Low participation - only 1 member active", severity: "high", time: "2min ago" },
  {
    id: 2,
    group: "Group 5",
    message: "Discussion stalled - no messages in 10min",
    severity: "medium",
    time: "5min ago",
  },
  { id: 3, group: "Group 3", message: "One member dominating conversation", severity: "low", time: "8min ago" },
]

const groupDetails = {
  id: 1,
  name: "Group 1",
  members: [
    { name: "Alice Chen", speakTime: "4min 30s", contributions: 8, role: "active" },
    { name: "Bob Wilson", speakTime: "3min 15s", contributions: 5, role: "moderate" },
    { name: "Carol Davis", speakTime: "6min 45s", contributions: 12, role: "leader" },
    { name: "David Kim", speakTime: "2min 20s", contributions: 3, role: "quiet" },
  ],
  summary:
    "The group is actively discussing the impact of artificial intelligence on education. Carol is leading the conversation with insightful questions, while Alice provides technical perspectives. Bob contributes practical examples, and David offers thoughtful but less frequent input.",
  discussionMode: "Collaborative with emerging leadership",
  engagementLevel: "High - Lively discussion with good participation",
  totalDuration: "16min 50s",
  totalContributions: 28,
}

// Mock student data
const allStudents = [
  { id: 1, name: "Alice Chen", avatar: "AC" },
  { id: 2, name: "Bob Wilson", avatar: "BW" },
  { id: 3, name: "Carol Davis", avatar: "CD" },
  { id: 4, name: "David Kim", avatar: "DK" },
  { id: 5, name: "Emma Johnson", avatar: "EJ" },
  { id: 6, name: "Frank Miller", avatar: "FM" },
  { id: 7, name: "Grace Lee", avatar: "GL" },
  { id: 8, name: "Henry Brown", avatar: "HB" },
  { id: 9, name: "Ivy Zhang", avatar: "IZ" },
  { id: 10, name: "Jack Smith", avatar: "JS" },
  { id: 11, name: "Kate Taylor", avatar: "KT" },
  { id: 12, name: "Leo Wang", avatar: "LW" },
  { id: 13, name: "Maya Patel", avatar: "MP" },
  { id: 14, name: "Noah Garcia", avatar: "NG" },
  { id: 15, name: "Olivia Martinez", avatar: "OM" },
]

export default function EducationDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")

  // Group formation state
  const [groupFormations, setGroupFormations] = useState([
    { id: 1, name: "Group 1", students: [1, 2, 3, 4] },
    { id: 2, name: "Group 2", students: [5, 6, 7] },
    { id: 3, name: "Group 3", students: [8, 9, 10] },
  ])
  const [unassignedStudents, setUnassignedStudents] = useState([11, 12, 13, 14, 15])

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleGroupClick = (groupId: number) => {
    setSelectedGroup(groupId)
    setActiveTab("group-details")
  }

  const addNewGroup = () => {
    const newGroupId = Math.max(...groupFormations.map((g) => g.id)) + 1
    setGroupFormations([
      ...groupFormations,
      {
        id: newGroupId,
        name: `Group ${newGroupId}`,
        students: [],
      },
    ])
  }

  const removeGroup = (groupId: number) => {
    const groupToRemove = groupFormations.find((g) => g.id === groupId)
    if (groupToRemove) {
      setUnassignedStudents([...unassignedStudents, ...groupToRemove.students])
      setGroupFormations(groupFormations.filter((g) => g.id !== groupId))
    }
  }

  const moveStudentToGroup = (studentId: number, targetGroupId: number) => {
    // Remove student from current location
    setUnassignedStudents(unassignedStudents.filter((id) => id !== studentId))
    setGroupFormations(
      groupFormations.map((group) => ({
        ...group,
        students: group.students.filter((id) => id !== studentId),
      })),
    )

    // Add student to target group
    if (targetGroupId === 0) {
      setUnassignedStudents([...unassignedStudents, studentId])
    } else {
      setGroupFormations(
        groupFormations.map((group) =>
          group.id === targetGroupId ? { ...group, students: [...group.students, studentId] } : group,
        ),
      )
    }
  }

  const autoAssignGroups = () => {
    const shuffled = [...allStudents].sort(() => Math.random() - 0.5)
    const groupSize = Math.ceil(shuffled.length / 3)

    const newGroups = [
      { id: 1, name: "Group 1", students: shuffled.slice(0, groupSize).map((s) => s.id) },
      { id: 2, name: "Group 2", students: shuffled.slice(groupSize, groupSize * 2).map((s) => s.id) },
      { id: 3, name: "Group 3", students: shuffled.slice(groupSize * 2).map((s) => s.id) },
    ]

    setGroupFormations(newGroups)
    setUnassignedStudents([])
  }

  const getStudentById = (id: number) => allStudents.find((s) => s.id === id)

  const processStudentFile = async (file: File) => {
    setIsProcessingFile(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      // Skip header if it exists
      const studentNames = lines
        .slice(1)
        .map((line) => {
          // Handle CSV format - take first column as name
          const name = line.split(",")[0].trim().replace(/"/g, "")
          return name
        })
        .filter((name) => name && name.length > 0)

      // Generate new student data
      const newStudents = studentNames.map((name, index) => {
        const nameParts = name.split(" ")
        const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("")
        return {
          id: allStudents.length + index + 1,
          name: name,
          avatar: initials.slice(0, 2), // Take first 2 initials
        }
      })

      // Update allStudents array and unassigned students
      allStudents.push(...newStudents)
      setUnassignedStudents([...unassignedStudents, ...newStudents.map((s) => s.id)])

      // Clear existing groups
      setGroupFormations([
        { id: 1, name: "Group 1", students: [] },
        { id: 2, name: "Group 2", students: [] },
        { id: 3, name: "Group 3", students: [] },
      ])
    } catch (error) {
      console.error("Error processing file:", error)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      processStudentFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b px-6 py-4 bg-white border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-700">Edu AI</h1>
          </div>
          <Avatar className="ring-2 ring-offset-2 ring-slate-200">
            <AvatarFallback className="text-white font-semibold bg-indigo-600">
              T
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Top Divider Line */}
      <div className="w-full h-px bg-slate-200" />

      {/* Navigation Tabs */}
      <div className="bg-gray-50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pt-4 pb-2">
          <TabsList className="bg-transparent border-0 h-auto p-0 gap-3">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=active]:border-0 rounded-lg px-4 py-2 font-medium transition-all duration-200 min-w-[120px] text-sm hover:bg-gray-100"
              style={{
                background: activeTab === "dashboard" ? "#4338CA" : "white",
                borderColor: activeTab === "dashboard" ? "transparent" : "#E5E7EB",
                border: activeTab === "dashboard" ? "none" : "1px solid #E5E7EB",
              }}
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="group-details"
              className="data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=active]:border-0 rounded-lg px-4 py-2 font-medium transition-all duration-200 min-w-[120px] text-sm hover:bg-gray-100"
              style={{
                background: activeTab === "group-details" ? "#4338CA" : "white",
                borderColor: activeTab === "group-details" ? "transparent" : "#E5E7EB",
                border: activeTab === "group-details" ? "none" : "1px solid #E5E7EB",
              }}
            >
              Group details
            </TabsTrigger>
            <TabsTrigger
              value="discussion-setting"
              className="data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=active]:border-0 rounded-lg px-4 py-2 font-medium transition-all duration-200 min-w-[140px] text-sm hover:bg-gray-100"
              style={{
                background: activeTab === "discussion-setting" ? "#4338CA" : "white",
                borderColor: activeTab === "discussion-setting" ? "transparent" : "#E5E7EB",
                border: activeTab === "discussion-setting" ? "none" : "1px solid #E5E7EB",
              }}
            >
              Pre-class Setup
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Groups Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <Card
                      key={group.id}
                      className="cursor-pointer transition-all duration-300 border rounded-lg overflow-hidden hover:bg-gray-50 bg-white border-slate-200"
                      onClick={() => handleGroupClick(group.id)}
                    >
                      <CardHeader className="pb-3 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-slate-800">{group.name}</CardTitle>
                          <Badge
                            variant={group.status === "active" ? "default" : "secondary"}
                            className={`${
                              group.status === "active" ? "text-white border-0 bg-green-600" : "bg-gray-100 text-gray-600 border-0"
                            } px-3 py-1 rounded-md font-medium`}
                          >
                            {group.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6 bg-white">
                        <div className="flex items-center justify-between text-sm text-slate-700">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{group.members} members</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{group.duration}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-medium text-slate-800">
                            <span>Participation Rate</span>
                            <span>{group.participation}%</span>
                          </div>
                          <div className="relative h-3 rounded-md overflow-hidden bg-slate-200">
                            <div
                              className="h-full transition-all duration-500 rounded-md bg-indigo-600"
                              style={{
                                width: `${group.participation}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-700 px-3 py-1 rounded-md bg-slate-50 border border-slate-200">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{group.contributions} contributions</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`border px-3 py-1 rounded-md font-medium ${
                              group.engagement === "high"
                                ? "border-green-300 text-green-700 bg-green-50"
                                : group.engagement === "medium"
                                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                  : "border-red-300 text-red-700 bg-red-50"
                            }`}
                          >
                            {group.engagement}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Alerts Panel */}
              <div className="lg:col-span-1">
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-orange-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      Real-time Alerts
                    </CardTitle>
                    <CardDescription className="text-orange-600">Groups needing attention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 bg-white">
                    {alerts.map((alert) => (
                      <Alert
                        key={alert.id}
                        className="border rounded-lg bg-red-50 border-red-200"
                      >
                        <AlertDescription className="text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-red-600" />
                            <span className="font-bold text-red-600">
                              {alert.group}
                            </span>
                          </div>
                          <div className="mb-2 leading-relaxed text-red-700">
                            {alert.message}
                          </div>
                          <div className="text-xs font-medium text-red-600">
                            {alert.time}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Group Details */}
          <TabsContent value="group-details" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Group 1</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Participation */}
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      Member Participation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 bg-white">
                    {groupDetails.members.map((member, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg space-y-3 bg-slate-50 border border-slate-200"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{member.name}</span>
                          <Badge
                            variant="outline"
                            className={`border px-3 py-1 rounded-md font-medium ${
                              member.role === "leader"
                                ? "text-white border-0 bg-indigo-600"
                                : member.role === "active"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : member.role === "moderate"
                                    ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                    : "border-gray-300 text-gray-700 bg-gray-50"
                            }`}
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
                            <Mic className="w-4 h-4" />
                            <span className="font-medium">{member.speakTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium">{member.contributions} contributions</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Discussion Analytics */}
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      Discussion Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 bg-white">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-800">Discussion Mode</Label>
                      <p className="text-sm text-slate-700 p-3 rounded-lg leading-relaxed bg-slate-50 border border-slate-200">
                        {groupDetails.discussionMode}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-800">Engagement Level</Label>
                      <p className="text-sm text-slate-700 p-3 rounded-lg leading-relaxed bg-slate-50 border border-slate-200">
                        {groupDetails.engagementLevel}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-2xl font-bold text-indigo-600">
                          {groupDetails.totalDuration}
                        </div>
                        <div className="text-xs font-medium mt-1 text-indigo-600">
                          Total Duration
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {groupDetails.totalContributions}
                        </div>
                        <div className="text-xs font-medium mt-1 text-blue-600">
                          Total Contributions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Summary */}
              <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <p className="text-slate-800 leading-relaxed p-4 rounded-lg bg-slate-50 border border-slate-200">
                    {groupDetails.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Mind Map Placeholder */}
              <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Discussion Mind Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="h-64 rounded-lg flex items-center justify-center border-2 border-dashed bg-slate-50 border-slate-300">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium">Mind map visualization would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discussion Setting */}
          <TabsContent value="discussion-setting" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Group Formation */}
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-800">Group Formation</CardTitle>
                          <CardDescription className="text-slate-600">
                            Assign students to discussion groups
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={autoAssignGroups}
                          variant="outline"
                          size="sm"
                          className="border text-slate-600 hover:bg-slate-100 hover:border-slate-300 bg-white transition-all duration-200 border-slate-200"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Auto Assign
                        </Button>
                        <Button
                          onClick={addNewGroup}
                          size="sm"
                          className="text-white border-0 px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 bg-indigo-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Group
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700">Upload Student List</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-slate-100 transition-all duration-200 border-slate-300 bg-slate-50">
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="student-file-upload"
                        />
                        <label
                          htmlFor="student-file-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-600">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-slate-700">
                              {isProcessingFile ? "Processing..." : "Upload CSV file with student names"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">CSV format: Name, Email (optional)</p>
                          </div>
                        </label>
                      </div>
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4" />
                          <span>Uploaded: {uploadedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6 bg-white">
                    {/* Unassigned Students */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700">Unassigned Students</Label>
                      <div className="min-h-[80px] p-4 border-2 border-dashed rounded-lg border-slate-300 bg-slate-50">
                        <div className="flex flex-wrap gap-2">
                          {unassignedStudents.map((studentId) => {
                            const student = getStudentById(studentId)
                            return student ? (
                              <div
                                key={student.id}
                                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-move hover:bg-slate-100 transition-all duration-200 border-slate-200"
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("studentId", student.id.toString())}
                              >
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs text-slate-600 bg-slate-100">
                                    {student.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{student.name}</span>
                              </div>
                            ) : null
                          })}
                          {unassignedStudents.length === 0 && (
                            <p className="text-slate-500 text-sm">All students have been assigned to groups</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Groups */}
                    <div className="space-y-4">
                      {groupFormations.map((group) => (
                        <div key={group.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-indigo-600">
                              {group.name}
                            </Label>
                            <Button
                              onClick={() => removeGroup(group.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div
                            className="min-h-[60px] p-3 border-2 border-dashed rounded-lg border-slate-300 bg-slate-100"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault()
                              const studentId = Number.parseInt(e.dataTransfer.getData("studentId"))
                              moveStudentToGroup(studentId, group.id)
                            }}
                          >
                            <div className="flex flex-wrap gap-2">
                              {group.students.map((studentId) => {
                                const student = getStudentById(studentId)
                                return student ? (
                                  <div
                                    key={student.id}
                                    className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-move hover:bg-slate-100 transition-all duration-200 border-slate-200"
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData("studentId", student.id.toString())}
                                  >
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs text-white bg-indigo-600">
                                        {student.avatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{student.name}</span>
                                  </div>
                                ) : null
                              })}
                              {group.students.length === 0 && (
                                <p className="text-sm text-indigo-600">
                                  Drag students here to assign them to this group
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button className="text-white border-0 px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 bg-indigo-600">
                        Save Group Formation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Learning Materials */}
              <div className="lg:col-span-1 space-y-6">
                {/* Learning Materials */}
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      Learning Materials
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Upload materials for students to reference during discussions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 bg-white">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-100 transition-all duration-200 border-slate-300 bg-slate-50">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 bg-blue-500">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-slate-700 mb-2 font-medium">Drag and drop files here, or click to browse</p>
                      <p className="text-sm text-slate-500 mb-4">
                        Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG
                      </p>
                      <p className="text-xs text-slate-400 mb-4">Maximum file size: 50MB per file</p>
                      <Button className="text-white border-0 px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 bg-blue-500">
                        Upload Files
                      </Button>
                    </div>

                    {/* Uploaded Files List */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800">Uploaded Materials</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">Course_Syllabus.pdf</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">Discussion_Guidelines.docx</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    id="learning-materials-upload"
                  />
                  <label htmlFor="learning-materials-upload" className="cursor-pointer block w-full h-full" />
                </Card>

                {/* AI Prompt Setting */}
                <Card className="border rounded-lg overflow-hidden bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      Set AI Assistant Prompt
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Configure the AI assistant that will guide student discussions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 bg-white">
                    <Textarea
                      placeholder="Enter the prompt for the AI assistant. For example: 'You are a helpful teaching assistant that guides students through collaborative discussions. Ask probing questions, encourage participation, and help students think critically about the topic...'"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[200px] border rounded-lg focus:border-indigo-300 transition-all duration-200 border-slate-200 bg-slate-50"
                    />
                    <div className="flex justify-end">
                      <Button className="text-white border-0 px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 bg-blue-500">
                        Save Prompt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
