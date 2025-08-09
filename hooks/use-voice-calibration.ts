
"use client"

import { useState, useRef } from 'react'

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const startCalibration = async (userId: string, userName: string): Promise<VoiceCalibrationResult | null> => {
    try {
      setIsCalibrating(true)
      setError(null)
      setCountdown(10)
      audioChunksRef.current = []

      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })

      // 创建录音器
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          // 停止所有音频轨道
          stream.getTracks().forEach(track => track.stop())

          // 合并音频数据
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // 发送到后端进行处理
          const formData = new FormData()
          formData.append('audio', audioBlob)
          formData.append('userId', userId)
          formData.append('userName', userName)

          const response = await fetch('/api/voice/calibrate', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()

          if (result.success) {
            setCalibrationComplete(true)
            setIsCalibrating(false)
            return result
          } else {
            setError(result.error || 'Voice calibration failed')
            setIsCalibrating(false)
            return null
          }
        } catch (error) {
          console.error('Error processing voice calibration:', error)
          setError('Failed to process voice recording')
          setIsCalibrating(false)
          return null
        }
      }

      // 开始录音
      mediaRecorder.start()

      // 倒计时
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            mediaRecorder.stop()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return new Promise((resolve) => {
        mediaRecorder.addEventListener('stop', () => {
          // 结果将在 onstop 处理器中处理
        })
      })

    } catch (error) {
      console.error('Voice calibration error:', error)
      setError('Failed to access microphone')
      setIsCalibrating(false)
      return null
    }
  }

  const resetCalibration = () => {
    setCalibrationComplete(false)
    setError(null)
    setCountdown(0)
  }

  return {
    isCalibrating,
    calibrationComplete,
    error,
    countdown,
    startCalibration,
    resetCalibration
  }
}
