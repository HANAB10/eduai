
"use client"

import { useState, useRef } from 'react'
import { useUser } from './use-user'

export interface VoiceCalibrationResult {
  success: boolean
  userId: string
  userName: string
  transcript: string
  message: string
}

export function useVoiceCalibration() {
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationComplete, setCalibrationComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [recognizedSentence, setRecognizedSentence] = useState<string>('')
  
  const { user } = useUser()
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const startCalibration = async (): Promise<VoiceCalibrationResult | null> => {
    if (!user) {
      setError('用户信息未找到')
      return null
    }
    
    const userId = user.id
    const userName = `${user.first_name} ${user.last_name}`
    
    try {
      setIsCalibrating(true)
      setError(null)
      setCountdown(10)

      // 模拟获取麦克风权限
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        })
        
        // 立即停止音频流，我们只是为了获取权限
        stream.getTracks().forEach(track => track.stop())
      } catch (micError) {
        setError('无法访问麦克风')
        setIsCalibrating(false)
        return null
      }

      // 开始倒计时模拟录音
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            // 模拟录音完成处理
            setTimeout(() => {
              const mockTranscript = "Hello, this is my voice for the team-based learning discussion on home healthcare safety."
              setRecognizedSentence(mockTranscript)
              setCalibrationComplete(true)
              setIsCalibrating(false)
            }, 500)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      countdownIntervalRef.current = countdownInterval

      // 返回模拟的成功结果
      return new Promise((resolve) => {
        setTimeout(() => {
          const result: VoiceCalibrationResult = {
            success: true,
            userId,
            userName,
            transcript: "Hello, this is my voice for the team-based learning discussion on home healthcare safety.",
            message: 'Voice calibration completed successfully'
          }
          resolve(result)
        }, 10500) // 10秒倒计时 + 0.5秒处理时间
      })

    } catch (error) {
      console.error('Voice calibration error:', error)
      setError('语音校准失败')
      setIsCalibrating(false)
      return null
    }
  }

  const stopCalibration = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setIsCalibrating(false)
    setCountdown(0)
  }

  const resetCalibration = () => {
    setCalibrationComplete(false)
    setError(null)
    setCountdown(0)
    setRecognizedSentence('')
  }

  return {
    isCalibrating,
    calibrationComplete,
    error: error,
    countdown,
    recognizedSentence,
    recording: isCalibrating,
    calibrationError: error,
    startCalibration,
    stopCalibration,
    resetCalibration
  }
}
