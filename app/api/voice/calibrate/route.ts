
import { NextRequest, NextResponse } from 'next/server'
import { extractVoiceFeatures, VoicePrint } from '@/lib/deepgram'
import { deepgram, transcriptionConfig } from '@/lib/deepgram'
import { voicePrintService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const userId = formData.get('userId') as string
    const userName = formData.get('userName') as string

    if (!audioFile || !userId || !userName) {
      return NextResponse.json({ error: 'Audio file, userId and userName are required' }, { status: 400 })
    }

    console.log(`Starting voice calibration for ${userName} (${userId})`)

    // 转换音频为 ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer()
    console.log(`Audio file size: ${audioBuffer.byteLength} bytes`)
    
    if (!deepgram) {
      return NextResponse.json({ error: 'Deepgram not configured' }, { status: 500 })
    }

    // 使用 Deepgram 进行语音识别以验证录音质量
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioBuffer),
      {
        ...transcriptionConfig,
        model: 'nova-2',
        language: 'en-US',
      }
    )

    if (error) {
      console.error('Deepgram transcription error:', error)
      return NextResponse.json({ error: 'Voice recognition failed' }, { status: 500 })
    }

    const transcript = result.results.channels[0].alternatives[0].transcript

    // 提取语音特征
    const voicePrint = await extractVoiceFeatures(new Blob([audioBuffer]), userId)
    
    // 存储语音特征到数据库
    await voicePrintService.saveVoicePrint({
      user_id: userId,
      features: voicePrint.features,
      sample_rate: voicePrint.sampleRate,
      duration: voicePrint.duration,
      transcript: transcript
    })

    // 获取总的校准用户数
    const allVoicePrints = await voicePrintService.getAllVoicePrints()

    console.log(`✅ Voice calibration completed for ${userName} (${userId})`)
    console.log(`📝 Transcript: "${transcript}"`)
    console.log(`👥 Total calibrated users: ${allVoicePrints.length}`)

    return NextResponse.json({
      success: true,
      userId,
      userName,
      transcript,
      message: 'Voice calibration completed successfully',
      totalCalibratedUsers: allVoicePrints.length
    })

  } catch (error) {
    console.error('Voice calibration error:', error)
    return NextResponse.json({ error: 'Voice calibration failed' }, { status: 500 })
  }
}

// 获取所有已校准的语音特征
export async function GET() {
  try {
    const voicePrints = await voicePrintService.getAllVoicePrints()
    
    const calibratedUsers = voicePrints.map(vp => ({
      userId: vp.user_id,
      userName: vp.first_name && vp.last_name ? `${vp.first_name} ${vp.last_name}` : `User ${vp.user_id}`,
      timestamp: vp.created_at,
      duration: vp.duration,
      transcript: vp.transcript
    }))

    return NextResponse.json({
      calibratedUsers,
      count: calibratedUsers.length
    })
  } catch (error) {
    console.error('Error fetching voice prints:', error)
    return NextResponse.json({ error: 'Failed to fetch voice calibration data' }, { status: 500 })
  }
}
