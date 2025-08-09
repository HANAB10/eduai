"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type SpeechRecognition from "speech-recognition"

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { continuous = true, interimResults = true, language = "zh-CN", onResult, onError } = options

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()

        recognition.continuous = continuous
        recognition.interimResults = interimResults
        recognition.lang = language

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          const fullTranscript = finalTranscript || interimTranscript
          setTranscript(fullTranscript)

          if (onResult && finalTranscript) {
            onResult({
              transcript: finalTranscript,
              confidence: event.results[event.results.length - 1][0].confidence || 0,
              isFinal: true,
            })
          }
        }

        recognition.onerror = (event: any) => {
          const errorMessage = `语音识别错误: ${event.error}`
          setError(errorMessage)
          setIsListening(false)

          if (onError) {
            onError(errorMessage)
          }
        }

        recognitionRef.current = recognition
      } else {
        setIsSupported(false)
        setError("浏览器不支持语音识别")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, interimResults, language, onResult, onError])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setError(null)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
