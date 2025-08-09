import { createClient, LiveTranscriptionEvents, LiveClient } from '@deepgram/sdk'

// 初始化 Deepgram 客户端
export const deepgram = process.env.DEEPGRAM_API_KEY 
  ? createClient(process.env.DEEPGRAM_API_KEY)
  : null

// 语音转文字配置
export const transcriptionConfig = {
  model: 'nova-2',
  language: 'zh-CN', // 中文识别，可以根据需要修改
  smart_format: true,
  interim_results: true,
  endpointing: 300,
  channels: 1,
  sample_rate: 16000,
}

// 说话人识别配置
export const speakerDetectionConfig = {
  ...transcriptionConfig,
  diarize: true, // 启用说话人分离
  multichannel: false,
  alternatives: 1,
  // 启用 Deepgram 的分析功能
  sentiment: true, // 情感分析
  topics: true, // 话题检测
  summarize: true, // 摘要生成
  detect_language: true, // 语言检测
  paragraphs: true, // 段落分割
  utterances: true, // 语句分割
  keywords: true, // 关键词提取
}

// 创建实时语音识别连接
export function createLiveTranscription(onTranscript: (data: any) => void, onError: (error: any) => void) {
  if (!deepgram) {
    throw new Error('Deepgram client not initialized')
  }
  const connection = deepgram.listen.live(speakerDetectionConfig)

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log('Deepgram 连接已建立')
  })

  connection.on(LiveTranscriptionEvents.Transcript, onTranscript)
  connection.on(LiveTranscriptionEvents.Error, onError)

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log('Deepgram 连接已关闭')
  })

  return connection
}

// 语音特征提取（用于说话人识别）
export interface VoicePrint {
  userId: string
  features: number[]
  sampleRate: number
  duration: number
  timestamp: Date
}

// 模拟语音特征提取（实际项目中需要更复杂的算法）
export function extractVoiceFeatures(audioData: Blob, userId: string): Promise<VoicePrint> {
  return new Promise((resolve) => {
    // 这里是简化的语音特征提取
    // 实际应用中需要使用更复杂的语音处理算法
    const features = Array.from({length: 128}, () => Math.random())

    resolve({
      userId,
      features,
      sampleRate: 16000,
      duration: audioData.size / (16000 * 2), // 估算时长
      timestamp: new Date()
    })
  })
}

// 说话人匹配函数
export function matchSpeaker(currentFeatures: number[], voicePrints: VoicePrint[]): string | null {
  let bestMatch = null
  let highestSimilarity = 0

  for (const voicePrint of voicePrints) {
    const similarity = calculateCosineSimilarity(currentFeatures, voicePrint.features)
    if (similarity > highestSimilarity && similarity > 0.7) { // 阈值可调
      highestSimilarity = similarity
      bestMatch = voicePrint.userId
    }
  }

  return bestMatch
}

// 余弦相似度计算
function calculateCosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

  return dotProduct / (magnitudeA * magnitudeB)
}