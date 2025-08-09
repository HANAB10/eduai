
import { NextRequest, NextResponse } from 'next/server'
import { createLiveTranscription, matchSpeaker, VoicePrint } from '@/lib/deepgram'

// WebSocket 连接管理（简化版本，实际项目中可能需要更复杂的管理）
const activeConnections = new Map()
const voicePrints = new Map<string, VoicePrint>() // 应该从数据库获取

export async function POST(request: NextRequest) {
  try {
    const { action, audioData, sessionId } = await request.json()

    if (action === 'start_transcription') {
      // 开始实时转录
      const connection = createLiveTranscription(
        (data) => {
          // 处理转录结果
          const transcript = data.channel.alternatives[0].transcript
          
          if (transcript && transcript.trim() !== '') {
            // 尝试识别说话人
            const speakerId = data.channel.alternatives[0].speaker // Deepgram 的说话人分离结果
            
            // 发送转录结果（实际项目中需要通过 WebSocket 发送）
            console.log(`Speaker ${speakerId}: ${transcript}`)
            
            // 这里可以将结果发送到文本分析平台
            // await sendToAnalysisPlatform(transcript, speakerId)
          }
        },
        (error) => {
          console.error('Transcription error:', error)
        }
      )

      activeConnections.set(sessionId, connection)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transcription started',
        sessionId 
      })
    }

    if (action === 'send_audio') {
      const connection = activeConnections.get(sessionId)
      if (connection && audioData) {
        // 发送音频数据到 Deepgram
        const audioBuffer = Buffer.from(audioData, 'base64')
        connection.send(audioBuffer)
      }
      
      return NextResponse.json({ success: true })
    }

    if (action === 'stop_transcription') {
      const connection = activeConnections.get(sessionId)
      if (connection) {
        connection.finish()
        activeConnections.delete(sessionId)
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Transcription stopped' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
