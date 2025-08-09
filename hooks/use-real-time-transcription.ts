
"use client"

import { useState, useRef, useCallback } from 'react'
import { useUser } from './use-user'

export interface TranscriptSegment {
  id: string
  speaker: string | null
  speakerId: string | null
  content: string
  timestamp: Date
  confidence: number
}

export function useRealTimeTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId] = useState(() => `session_${Date.now()}`)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { user } = useUser()

  const startTranscription = useCallback(async () => {
    try {
      setError(null)
      setIsTranscribing(true)

      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      streamRef.current = stream

      // 启动转录会话
      await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_transcription',
          sessionId: currentSessionId
        })
      })

      // 创建录音器，持续发送音频数据
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // 将音频数据转换为 base64 并发送
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            
            await fetch('/api/voice/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'send_audio',
                audioData: base64Data,
                sessionId: currentSessionId
              })
            })
          }
          reader.readAsDataURL(event.data)
        }
      }

      // 每100ms发送一次数据
      mediaRecorder.start(100)

      console.log('Real-time transcription started')

    } catch (error) {
      console.error('Failed to start transcription:', error)
      setError('Failed to start voice transcription')
      setIsTranscribing(false)
    }
  }, [currentSessionId])

  const stopTranscription = useCallback(async () => {
    try {
      // 停止录音
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }

      // 停止音频流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // 停止转录会话
      await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_transcription',
          sessionId: currentSessionId
        })
      })

      setIsTranscribing(false)
      console.log('Real-time transcription stopped')

    } catch (error) {
      console.error('Failed to stop transcription:', error)
      setError('Failed to stop transcription')
    }
  }, [currentSessionId])

  const addTranscript = useCallback((segment: Omit<TranscriptSegment, 'id' | 'timestamp'>) => {
    const newSegment: TranscriptSegment = {
      ...segment,
      id: `transcript_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    }
    
    setTranscripts(prev => [...prev, newSegment])
  }, [])

  const clearTranscripts = useCallback(() => {
    setTranscripts([])
  }, [])

  return {
    isTranscribing,
    transcripts,
    error,
    startTranscription,
    stopTranscription,
    addTranscript,
    clearTranscripts
  }
}
