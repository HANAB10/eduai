
import { 
  SpeechConfig, 
  AudioConfig, 
  VoiceProfileClient,
  VoiceProfile,
  SpeakerRecognizer,
  SpeakerIdentificationModel,
  VoiceProfileType,
  ResultReason
} from 'microsoft-cognitiveservices-speech-sdk'

// Azure 语音服务配置
export const speechConfig = process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION
  ? SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY, process.env.AZURE_SPEECH_REGION)
  : null

if (speechConfig) {
  speechConfig.speechRecognitionLanguage = 'en-US'
}

// 语音特征接口
export interface AzureVoicePrint {
  userId: string
  profileId: string
  enrollmentStatus: string
  createdDateTime: Date
}

// 存储用户的语音配置文件
const voiceProfiles = new Map<string, VoiceProfile>()
const userProfiles = new Map<string, AzureVoicePrint>()

export class AzureSpeakerRecognitionService {
  private voiceProfileClient: VoiceProfileClient | null = null
  private speakerRecognizer: SpeakerRecognizer | null = null

  constructor() {
    if (speechConfig) {
      this.voiceProfileClient = new VoiceProfileClient(speechConfig)
    }
  }

  // 创建语音配置文件进行注册
  async createVoiceProfile(userId: string): Promise<{ success: boolean, profileId?: string, error?: string }> {
    if (!this.voiceProfileClient) {
      return { success: false, error: 'Azure Speech service not configured' }
    }

    try {
      const profile = await this.voiceProfileClient.createProfileAsync(
        VoiceProfileType.TextDependentVerification,
        'en-us'
      )

      const voicePrint: AzureVoicePrint = {
        userId,
        profileId: profile.profileId,
        enrollmentStatus: 'enrolling',
        createdDateTime: new Date()
      }

      voiceProfiles.set(userId, profile)
      userProfiles.set(userId, voicePrint)

      return { success: true, profileId: profile.profileId }
    } catch (error) {
      console.error('Failed to create voice profile:', error)
      return { success: false, error: 'Failed to create voice profile' }
    }
  }

  // 注册语音样本
  async enrollVoiceProfile(userId: string, audioBuffer: ArrayBuffer): Promise<{ success: boolean, enrollmentStatus?: string, error?: string }> {
    if (!this.voiceProfileClient) {
      return { success: false, error: 'Azure Speech service not configured' }
    }

    const profile = voiceProfiles.get(userId)
    if (!profile) {
      return { success: false, error: 'Voice profile not found' }
    }

    try {
      // 创建音频配置
      const audioConfig = AudioConfig.fromWavFileInput(new Uint8Array(audioBuffer))
      
      const result = await this.voiceProfileClient.enrollProfileAsync(
        profile,
        audioConfig
      )

      // 更新注册状态
      const userProfile = userProfiles.get(userId)
      if (userProfile) {
        userProfile.enrollmentStatus = result.reason === ResultReason.EnrolledVoiceProfile ? 'enrolled' : 'enrolling'
        userProfiles.set(userId, userProfile)
      }

      return { 
        success: true, 
        enrollmentStatus: userProfile?.enrollmentStatus 
      }
    } catch (error) {
      console.error('Failed to enroll voice profile:', error)
      return { success: false, error: 'Failed to enroll voice profile' }
    }
  }

  // 识别说话人
  async identifySpeaker(audioBuffer: ArrayBuffer, userIds: string[]): Promise<{ success: boolean, identifiedUserId?: string, confidence?: number, error?: string }> {
    if (!speechConfig) {
      return { success: false, error: 'Azure Speech service not configured' }
    }

    try {
      // 获取所有相关的语音配置文件
      const profiles = userIds
        .map(userId => voiceProfiles.get(userId))
        .filter(profile => profile !== undefined) as VoiceProfile[]

      if (profiles.length === 0) {
        return { success: false, error: 'No enrolled voice profiles found' }
      }

      // 创建音频配置和识别器
      const audioConfig = AudioConfig.fromWavFileInput(new Uint8Array(audioBuffer))
      const model = SpeakerIdentificationModel.fromProfiles(profiles)
      const recognizer = new SpeakerRecognizer(speechConfig, audioConfig)

      // 执行识别
      const result = await recognizer.recognizeOnceAsync(model)

      if (result.reason === ResultReason.RecognizedSpeakers) {
        // 找到匹配的用户ID
        const identifiedProfileId = result.profileId
        const identifiedUserId = Array.from(userProfiles.entries())
          .find(([_, profile]) => profile.profileId === identifiedProfileId)?.[0]

        return {
          success: true,
          identifiedUserId,
          confidence: result.score
        }
      }

      return { success: false, error: 'No speaker identified' }
    } catch (error) {
      console.error('Failed to identify speaker:', error)
      return { success: false, error: 'Failed to identify speaker' }
    }
  }

  // 获取用户的语音配置文件信息
  getUserProfile(userId: string): AzureVoicePrint | null {
    return userProfiles.get(userId) || null
  }

  // 获取所有注册用户
  getEnrolledUsers(): string[] {
    return Array.from(userProfiles.entries())
      .filter(([_, profile]) => profile.enrollmentStatus === 'enrolled')
      .map(([userId]) => userId)
  }
}

// 单例实例
export const azureSpeakerService = new AzureSpeakerRecognitionService()
