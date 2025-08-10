
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, User, Clock, FileAudio, CheckCircle } from 'lucide-react'

interface CalibrationData {
  userId: string
  timestamp: string
  duration: number
}

interface CalibrationResult {
  calibratedUsers: CalibrationData[]
  count: number
}

export default function VoiceStatusPage() {
  const [calibrationData, setCalibrationData] = useState<CalibrationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalibrationStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/voice/calibrate')
      const data = await response.json()
      
      if (response.ok) {
        setCalibrationData(data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch calibration data')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching calibration data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalibrationStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voice calibration data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Mic className="w-8 h-8 text-blue-600" />
            Voice Calibration Status
          </h1>
          <p className="text-gray-600">
            View and manage voice calibration data for team members
          </p>
        </div>

        {/* Status Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Calibration Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Total Users</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {calibrationData?.count || 0}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Status</span>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {calibrationData && calibrationData.count > 0 ? 'Active' : 'No Data'}
                </Badge>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileAudio className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Last Updated</span>
                </div>
                <div className="text-sm text-purple-700">
                  {calibrationData?.calibratedUsers?.[0]?.timestamp 
                    ? new Date(calibrationData.calibratedUsers[0].timestamp).toLocaleString('zh-CN')
                    : 'No data'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calibrated Users List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Calibrated Users</CardTitle>
            <Button onClick={fetchCalibrationStatus} variant="outline" size="sm">
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">Error: {error}</p>
              </div>
            )}

            {calibrationData && calibrationData.calibratedUsers.length > 0 ? (
              <div className="space-y-3">
                {calibrationData.calibratedUsers.map((user, index) => (
                  <div 
                    key={user.userId || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            User ID: {user.userId}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(user.timestamp).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          Calibrated
                        </Badge>
                        {user.duration && (
                          <div className="text-sm text-gray-500 mt-1">
                            Duration: {user.duration}s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Voice Calibration Data
                </h3>
                <p className="text-gray-500 mb-4">
                  No users have completed voice calibration yet.
                </p>
                <Button onClick={() => window.location.href = '/student'} variant="outline">
                  Go to Student Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to View More Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Voice calibration data is stored in memory and will reset when the server restarts</p>
              <p>• Each user's voice print includes unique audio characteristics for speaker identification</p>
              <p>• The transcript shows what was recognized from your calibration recording</p>
              <p>• For production use, this data should be stored in a database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
