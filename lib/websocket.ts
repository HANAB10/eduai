"use client"

interface WebSocketMessage {
  type: "discussion" | "ai_intervention" | "user_join" | "user_leave"
  data: any
  timestamp: Date
  userId?: string
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Function[]> = new Map()

  connect(roomId: string) {
    try {
      // 在实际应用中，这里应该连接到真实的WebSocket服务器
      // this.ws = new WebSocket(`ws://localhost:3001/room/${roomId}`)

      // 模拟WebSocket连接
      this.simulateConnection()
    } catch (error) {
      console.error("WebSocket连接失败:", error)
      this.handleReconnect()
    }
  }

  private simulateConnection() {
    // 模拟WebSocket事件
    setTimeout(() => {
      this.emit("connected", { message: "已连接到讨论室" })
    }, 1000)

    // 模拟其他用户的消息
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.emit("message", {
          type: "discussion",
          data: {
            speaker: "其他用户",
            content: "这是来自其他用户的模拟消息",
            timestamp: new Date(),
          },
        })
      }
    }, 10000)
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        // this.connect(roomId) // 需要保存roomId
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // 模拟发送消息
      console.log("模拟发送消息:", message)
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsManager = new WebSocketManager()
