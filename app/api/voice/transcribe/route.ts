
import { NextRequest, NextResponse } from 'next/server'
import { createLiveTranscription, deepgram } from '@/lib/deepgram'
import { azureSpeakerService } from '@/lib/azure-speaker-recognition'

// WebSocket 连接管理（简化版本，实际项目中可能需要更复杂的管理）
const activeConnections = new Map()
const voicePrints = new Map<string, VoicePrint>() // 应该从数据库获取

// 存储分析结果
const analysisResults = new Map<string, any[]>() // sessionId -> analysis[]

function storeAnalysisResult(sessionId: string, analysis: any) {
  if (!analysisResults.has(sessionId)) {
    analysisResults.set(sessionId, [])
  }
  analysisResults.get(sessionId)!.push(analysis)
}

// 存储音频数据用于说话人识别
let currentAudioBuffer: ArrayBuffer | null = null

export async function POST(request: NextRequest) {
  try {
    const { action, audioData, sessionId } = await request.json()

    if (action === 'start_transcription') {
      if (!deepgram) {
        return NextResponse.json({ error: 'Deepgram not configured' }, { status: 500 })
      }
      // 开始实时转录
      const connection = createLiveTranscription(
        async (data) => {
          // 处理转录结果
          const transcript = data.channel.alternatives[0].transcript
          
          if (transcript && transcript.trim() !== '') {
            // 使用 Azure 进行说话人识别
            let identifiedUserId = null
            try {
              const enrolledUsers = azureSpeakerService.getEnrolledUsers()
              if (enrolledUsers.length > 0 && currentAudioBuffer) {
                const identificationResult = await azureSpeakerService.identifySpeaker(currentAudioBuffer, enrolledUsers)
                if (identificationResult.success) {
                  identifiedUserId = identificationResult.identifiedUserId
                  console.log(`🎯 Speaker identified: ${identifiedUserId}`)
                }
              }
            } catch (error) {
              console.error('Speaker identification error:', error)
            }
            
            // 提取 Deepgram 的分析结果，结合 Azure 的说话人识别
            const analysis = {
              transcript,
              speakerId: identifiedUserId, // 使用 Azure 识别的说话人
              sentiment: data.channel.alternatives[0].sentiment, // 情感分析
              topics: data.metadata?.topics || [], // 话题检测
              keywords: data.metadata?.keywords || [], // 关键词
              confidence: data.channel.alternatives[0].confidence,
              timestamp: new Date().toISOString()
            }
            
            // 发送分析结果（实际项目中需要通过 WebSocket 发送）
            console.log('Deepgram Analysis:', analysis)
            
            // 存储分析结果到内存（实际应用中存储到数据库）
            storeAnalysisResult(sessionId, analysis)
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
        currentAudioBuffer = audioBuffer.buffer // 保存用于说话人识别
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

    if (action === 'get_analysis') {
      const results = analysisResults.get(sessionId) || []
      
      // 生成分析摘要
      const summary = generateAnalysisSummary(results)
      
      return NextResponse.json({ 
        success: true, 
        results,
        summary
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    const results = analysisResults.get(sessionId) || []
    const summary = generateAnalysisSummary(results)
    
    return NextResponse.json({ 
      success: true, 
      results,
      summary
    })
    
  } catch (error) {
    console.error('Get analysis API error:', error)
    return NextResponse.json({ error: 'Failed to get analysis' }, { status: 500 })
  }
}

function generateAnalysisSummary(results: any[]) {
  if (results.length === 0) return null
  
  // 统计情感分析
  const sentiments = results.filter(r => r.sentiment).map(r => r.sentiment)
  const sentimentCounts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // 提取所有话题
  const allTopics = results.flatMap(r => r.topics || [])
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // 提取所有关键词
  const allKeywords = results.flatMap(r => r.keywords || [])
  const keywordCounts = allKeywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // 说话人统计
  const speakerStats = results.reduce((acc, r) => {
    if (r.speakerId) {
      acc[r.speakerId] = (acc[r.speakerId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalSegments: results.length,
    sentimentAnalysis: sentimentCounts,
    topTopics: Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    topKeywords: Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    speakerParticipation: speakerStats,
    averageConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
  }
}
