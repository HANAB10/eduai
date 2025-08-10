import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { azureSpeakerService } from '@/lib/azure-speaker-recognition'
import { transcriptionConfig } from '@/lib/deepgram' // Assuming deepgram is still used for transcription quality check
import { deepgram } from '@/lib/deepgram' // Assuming deepgram is still used for transcription quality check

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
    console.log(`Audio file type: ${audioFile.type}, size: ${audioFile.size} bytes`)

    // 验证Azure配置
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      console.error('Azure Speech service not configured')
      return NextResponse.json({ error: 'Voice recognition service not configured' }, { status: 500 })
    }

    // 转换音频为 ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer()
    console.log(`Audio buffer size: ${audioBuffer.byteLength} bytes`)

    // Optional: Use Deepgram for initial transcription quality check if needed
    let transcript = ''
    if (deepgram) {
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
        // Decide whether to proceed without transcription or return an error
      } else {
        transcript = result.results.channels[0].alternatives[0].transcript
      }
    } else {
      console.warn('Deepgram not configured, skipping transcription quality check.')
    }


    // 检查是否已有语音配置文件，如果有则先删除
    const existingProfile = azureSpeakerService.getUserProfile(userId)
    if (existingProfile) {
      console.log(`Deleting existing voice profile for user ${userId}`)
      await azureSpeakerService.deleteVoiceProfile(existingProfile.profileId)
    }

    // 创建 Azure 语音配置文件
    console.log(`Creating voice profile for user: ${userId}`)
    let profileResult = await azureSpeakerService.createVoiceProfile(userId)
    if (!profileResult.success) {
      console.error(`Failed to create profile: ${profileResult.error}`)
      return NextResponse.json({ error: profileResult.error }, { status: 500 })
    }
    
    console.log(`Profile created successfully: ${profileResult.profileId}`)

    // 注册语音样本
    console.log(`Enrolling voice sample for user: ${userId}`)
    const enrollResult = await azureSpeakerService.enrollVoiceProfile(userId, audioBuffer)
    if (!enrollResult.success) {
      console.error(`Failed to enroll profile: ${enrollResult.error}`)
      // If enrollment fails, delete the created profile
      if (profileResult.profileId) {
        await azureSpeakerService.deleteVoiceProfile(profileResult.profileId)
      }
      return NextResponse.json({ error: enrollResult.error }, { status: 500 })
    }
    
    console.log(`Voice enrollment completed with status: ${enrollResult.enrollmentStatus}`)

    // 存储到数据库
    await db.query(
      'INSERT INTO voice_calibrations (user_id, profile_id, enrollment_status, transcript) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET profile_id = $2, enrollment_status = $3, transcript = $4, updated_at = CURRENT_TIMESTAMP',
      [userId, profileResult.profileId, enrollResult.enrollmentStatus, transcript]
    )

    // 获取所有已校准的用户信息（可能需要调整此逻辑以适应 Azure 的用户管理）
    // const allVoicePrints = await voicePrintService.getAllVoicePrints() // This function might need to be adapted or removed if not directly mapping to Azure profiles

    console.log(`✅ Voice calibration completed for ${userName} (${userId})`)
    console.log(`📝 Transcript: "${transcript}"`)
    // console.log(`👥 Total calibrated users: ${allVoicePrints.length}`) // Adjust this log message

    return NextResponse.json({
      success: true,
      userId,
      userName,
      transcript,
      message: 'Voice calibration completed successfully',
      // totalCalibratedUsers: allVoicePrints.length // Adjust this response
    })

  } catch (error) {
    console.error('Voice calibration error:', error)
    // Attempt to clean up any partial Azure profile creation if an error occurs before enrollment
    if (error instanceof Error && (error as any).userId) {
        try {
            const userId = (error as any).userId; // Assuming userId is available in the error context
            const profileId = await db.query('SELECT profile_id FROM voice_calibrations WHERE user_id = ?', [userId]);
            if (profileId && profileId.length > 0) {
                await azureSpeakerService.deleteVoiceProfile(profileId[0].profile_id);
                await db.query('DELETE FROM voice_calibrations WHERE user_id = ?', [userId]);
            }
        } catch (cleanupError) {
            console.error('Error during cleanup after calibration failure:', cleanupError);
        }
    }
    return NextResponse.json({ error: 'Voice calibration failed' }, { status: 500 })
  }
}

// 获取所有已校准的语音特征
export async function GET() {
  try {
    // This GET endpoint might need to be updated to fetch profile IDs and statuses from Azure,
    // or query the local database for enrollment status if that's the desired behavior.
    // For now, assuming it fetches from the local DB.
    const voicePrints = await db.query('SELECT user_id, profile_id, enrollment_status, transcript FROM voice_calibrations')

    const calibratedUsers = voicePrints.map(vp => ({
      userId: vp.user_id,
      // userName needs to be fetched from another source or passed differently if not stored in voice_calibrations
      userName: `User ${vp.user_id}`, // Placeholder, adjust as needed
      timestamp: vp.created_at, // Assuming created_at is available or needs to be fetched separately
      enrollmentStatus: vp.enrollment_status,
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