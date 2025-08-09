
import { NextRequest, NextResponse } from 'next/server'
import { extractVoiceFeatures, VoicePrint } from '@/lib/deepgram'
import { deepgram, transcriptionConfig } from '@/lib/deepgram'

// 存储语音特征（实际项目中应该存储到数据库）
const voicePrints = new Map<string, VoicePrint>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const userId = formData.get('userId') as string
    const userName = formData.get('userName') as string

    if (!audioFile || !userId) {
      return NextResponse.json({ error: 'Audio file and userId are required' }, { status: 400 })
    }

    // 转换音频为 ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer()
    
    // 使用 Deepgram 进行语音识别以验证录音质量
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioBuffer),
      {
        ...transcriptionConfig,
        model: 'nova-2',
        language: 'zh-CN',
      }
    )

    if (error) {
      console.error('Deepgram transcription error:', error)
      return NextResponse.json({ error: 'Voice recognition failed' }, { status: 500 })
    }

    const transcript = result.results.channels[0].alternatives[0].transcript

    // 提取语音特征
    const voicePrint = await extractVoiceFeatures(new Blob([audioBuffer]), userId)
    
    // 存储语音特征
    voicePrints.set(userId, voicePrint)

    console.log(`Voice calibration completed for user ${userName} (${userId})`)
    console.log(`Transcript: ${transcript}`)

    return NextResponse.json({
      success: true,
      userId,
      userName,
      transcript,
      message: 'Voice calibration completed successfully'
    })

  } catch (error) {
    console.error('Voice calibration error:', error)
    return NextResponse.json({ error: 'Voice calibration failed' }, { status: 500 })
  }
}

// 获取所有已校准的语音特征
export async function GET() {
  const calibratedUsers = Array.from(voicePrints.entries()).map(([userId, voicePrint]) => ({
    userId,
    timestamp: voicePrint.timestamp,
    duration: voicePrint.duration
  }))

  return NextResponse.json({
    calibratedUsers,
    count: calibratedUsers.length
  })
}
