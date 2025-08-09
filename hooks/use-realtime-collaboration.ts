"use client"

import { useState, useEffect, useCallback } from "react"
import { wsManager } from "@/lib/websocket"

interface CollaborationState {
  connectedUsers: string[]
  isConnected: boolean
  roomId: string | null
}

interface CollaborationMessage {
  type: "discussion" | "ai_intervention" | "user_action"
  data: any
  userId: string
  timestamp: Date
}

export function useRealtimeCollaboration(roomId?: string) {
  const [state, setState] = useState<CollaborationState>({
    connectedUsers: [],
    isConnected: false,
    roomId: null,
  })

  const [messages, setMessages] = useState<CollaborationMessage[]>([])

  useEffect(() => {
    if (roomId) {
      // 连接到协作房间
      wsManager.connect(roomId)

      // 监听连接状态
      wsManager.on("connected", () => {
        setState((prev) => ({ ...prev, isConnected: true, roomId }))
      })

      // 监听用户加入/离开
      wsManager.on("user_join", (data: { userId: string }) => {
        setState((prev) => ({
          ...prev,
          connectedUsers: [...prev.connectedUsers, data.userId],
        }))
      })

      wsManager.on("user_leave", (data: { userId: string }) => {
        setState((prev) => ({
          ...prev,
          connectedUsers: prev.connectedUsers.filter((id) => id !== data.userId),
        }))
      })

      // 监听消息
      wsManager.on("message", (message: CollaborationMessage) => {
        setMessages((prev) => [...prev.slice(-50), message]) // 保留最近50条消息
      })

      return () => {
        wsManager.disconnect()
        setState({
          connectedUsers: [],
          isConnected: false,
          roomId: null,
        })
      }
    }
  }, [roomId])

  const sendMessage = useCallback((type: CollaborationMessage["type"], data: any) => {
    const message: CollaborationMessage = {
      type,
      data,
      userId: "current-user", // 在实际应用中应该是真实的用户ID
      timestamp: new Date(),
    }

    wsManager.sendMessage({
      type,
      data,
      timestamp: new Date(),
      userId: "current-user",
    })

    // 本地也添加消息
    setMessages((prev) => [...prev.slice(-50), message])
  }, [])

  const broadcastDiscussion = useCallback(
    (discussion: any) => {
      sendMessage("discussion", discussion)
    },
    [sendMessage],
  )

  const broadcastAIIntervention = useCallback(
    (intervention: any) => {
      sendMessage("ai_intervention", intervention)
    },
    [sendMessage],
  )

  return {
    ...state,
    messages,
    sendMessage,
    broadcastDiscussion,
    broadcastAIIntervention,
  }
}
