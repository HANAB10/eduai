"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useUser } from "@/hooks/use-user"
import {
  Archive,
  BookOpen,
  Brain,
  Compass,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  HelpCircle,
  Lightbulb,
  LogOut,
  Mic,
  Network,
  Pause,
  Play,
  Plus,
  Puzzle,
  Square,
  User as UserIcon,
  Users,
} from "lucide-react"
import { useRealTimeTranscription } from "@/hooks/use-real-time-transcription"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useVoiceCalibration } from "@/hooks/use-voice-calibration"

interface AIIntervention {
  id: string
  type:
    | "socratic_question"
    | "knowledge_synthesis"
    | "logic_clarification"
    | "resource_provision"
    | "process_guidance"
    | "summary_generation"
  content: string
  timestamp: Date
  priority: "low" | "medium" | "high"
  relatedKeywords: string[]
  targetSpeaker?: string
  followUpQuestions?: string[]
  resources?: Array<{
    id: string
    title?: string
    name?: string
    type: "document" | "webpage" | "research" | "video"
    url?: string
    content?: string
    summary: string
    definition?: string
  }>
  context: {
    triggerType: "silence" | "confusion" | "depth_needed" | "synthesis_time" | "knowledge_gap" | "user_message" | "logic_clarification" | "general" | "discussion_start"
    relatedNodes: string[]
  }
}

interface Discussion {
  id: string
  speaker: string
  content: string
  timestamp: Date
  quality: number
  keywords: string[]
  concepts: string[]
  logicalStructure: {
    hasEvidence: boolean
    hasClaim: boolean
    hasReasoning: boolean
    hasCounterargument: boolean
  }
  thoughtType: "question" | "answer" | "example" | "theory" | "challenge" | "synthesis"
  connectsTo: string[]
}

interface DiscussionSummary {
  phase: string
  keyPoints: string[]
  unresolved: string[]
  insights: string[]
  nextSteps: string[]
  knowledgeGaps: string[]
}

interface KnowledgeBase {
  concepts: Array<{
    id: string
    name: string
    definition: string
    examples: string[]
    relatedConcepts: string[]
    sourceDiscussions: string[]
    confidence: number
  }>
  relationships: Array<{
    from: string
    to: string
    type: "is_a" | "part_of" | "causes" | "enables" | "conflicts_with"
    evidence: string[]
    strength: number
  }>
  insights: Array<{
    id: string
    content: string
    supportingEvidence: string[]
    confidence: number
    timestamp: Date
  }>
}

interface Message {
  id: string
  type: "user_message" | "ai_message" | "system_message"
  content: string
  timestamp: Date
  author: string // e.g., "Alice", "AI Assistant", "You"
}

interface Resource {
  id: string
  name?: string
  title?: string
  type: "document" | "webpage" | "research" | "video"
  url?: string
  content?: string
  summary: string
  definition?: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  participationLevel: number
  lastSpoke: Date | null
  speakingTime: number
  thinkingPatterns: {
    analytical: number
    creative: number
    critical: number
    practical: number
  }
  contributionTypes: {
    questions: number
    examples: number
    theories: number
    challenges: number
  }
}

interface ThinkingNode {
  id: string
  type: "concept" | "question" | "insight" | "connection" | "conclusion"
  content: string
  position: { x: number; y: number }
  connections: Array<{
    to: string
    type: "leads_to" | "supports" | "contradicts" | "explains" | "examples"
    strength: number
  }>
  discussionIds: string[]
  timestamp: Date
  importance: number
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Team members data
const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alice Chen",
    avatar: "AC",
    participationLevel: 85,
    lastSpoke: null,
    speakingTime: 0,
    thinkingPatterns: {
      analytical: 80,
      creative: 70,
      critical: 90,
      practical: 65,
    },
    contributionTypes: {
      questions: 0,
      examples: 0,
      theories: 0,
      challenges: 0,
    },
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "MJ",
    participationLevel: 72,
    lastSpoke: null,
    speakingTime: 0,
    thinkingPatterns: {
      analytical: 60,
      creative: 85,
      critical: 70,
      practical: 80,
    },
    contributionTypes: {
      questions: 0,
      examples: 0,
      theories: 0,
      challenges: 0,
    },
  },
  {
    id: "3",
    name: "Sarah Williams",
    avatar: "SW",
    participationLevel: 92,
    lastSpoke: null,
    speakingTime: 0,
    thinkingPatterns: {
      analytical: 95,
      creative: 75,
      critical: 85,
      practical: 90,
    },
    contributionTypes: {
      questions: 0,
      examples: 0,
      theories: 0,
      challenges: 0,
    },
  },
  {
    id: "4",
    name: "David Park",
    avatar: "DP",
    participationLevel: 58,
    lastSpoke: null,
    speakingTime: 0,
    thinkingPatterns: {
      analytical: 70,
      creative: 60,
      critical: 65,
      practical: 85,
    },
    contributionTypes: {
      questions: 0,
      examples: 0,
      theories: 0,
      challenges: 0,
    },
  },
]

export default function EduMindAI() {
  const [aiActiveMode, setAiActiveMode] = useState(true)
  const [aiInterventions, setAiInterventions] = useState<AIIntervention[]>([])
  const [currentQuestionInput, setCurrentQuestionInput] = useState("")
  const [currentTopic, setCurrentTopic] = useState("Technology and Student Health: Digital Wellness")
  const [discussionPhase, setDiscussionPhase] = useState<"opening" | "exploration" | "deepening" | "synthesis">("opening")
  const [discussionSummary, setDiscussionSummary] = useState<DiscussionSummary>({
    phase: "opening",
    keyPoints: [],
    unresolved: [],
    insights: [],
    nextSteps: [],
    knowledgeGaps: [],
  })
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: "1",
      speaker: "Alice Chen",
      content: "I think sleep disruption is the biggest challenge. When I use my phone before bed, it takes me much longer to fall asleep.",
      timestamp: new Date(Date.now() - 480000),
      quality: 4,
      keywords: ["sleep", "disruption", "phone", "bed"],
      concepts: ["sleep disruption", "screen time", "bedtime habits"],
      logicalStructure: { hasEvidence: true, hasClaim: true, hasReasoning: true, hasCounterargument: false },
      thoughtType: "answer",
      connectsTo: [],
    },
    {
      id: "2",
      speaker: "Marcus Johnson",
      content: "I agree about sleep, but I think notification stress is worse. Constant alerts make me anxious even when I'm trying to study.",
      timestamp: new Date(Date.now() - 420000),
      quality: 4,
      keywords: ["notification", "stress", "alerts", "anxious", "study"],
      concepts: ["notification stress", "anxiety", "concentration"],
      logicalStructure: { hasEvidence: true, hasClaim: true, hasReasoning: true, hasCounterargument: false },
      thoughtType: "challenge",
      connectsTo: ["1"],
    },
    {
      id: "3",
      speaker: "Sarah Williams",
      content: "Both are important, but what about concentration problems? I can't focus on reading for more than 10 minutes without checking my phone.",
      timestamp: new Date(Date.now() - 360000),
      quality: 3,
      keywords: ["concentration", "focus", "reading", "checking", "phone"],
      concepts: ["concentration loss", "attention span", "digital distraction"],
      logicalStructure: { hasEvidence: true, hasClaim: true, hasReasoning: false, hasCounterargument: false },
      thoughtType: "question",
      connectsTo: ["1", "2"],
    },
    {
      id: "4",
      speaker: "David Park",
      content: "The research shows that blue light exposure before bed reduces melatonin production by up to 23%. That's why sleep should be ranked first.",
      timestamp: new Date(Date.now() - 300000),
      quality: 5,
      keywords: ["research", "blue light", "melatonin", "production", "ranked"],
      concepts: ["blue light", "melatonin", "sleep disruption", "research evidence"],
      logicalStructure: { hasEvidence: true, hasClaim: true, hasReasoning: true, hasCounterargument: false },
      thoughtType: "answer",
      connectsTo: ["1"],
    },
    {
      id: "5",
      speaker: "Marcus Johnson",
      content: "But David, doesn't that ignore the psychological impact? Notification anxiety affects us even during the day, not just at bedtime.",
      timestamp: new Date(Date.now() - 240000),
      quality: 4,
      keywords: ["psychological", "impact", "notification", "anxiety", "daytime"],
      concepts: ["psychological effects", "notification stress", "daily impact"],
      logicalStructure: { hasEvidence: false, hasClaim: true, hasReasoning: true, hasCounterargument: true },
      thoughtType: "challenge",
      connectsTo: ["4", "2"],
    },
  ])
  const [discussionTime, setDiscussionTime] = useState(550) // 9 minutes 10 seconds
  const [isDiscussionActive, setIsDiscussionActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
    concepts: [],
    relationships: [],
    insights: [],
  })
  const [memberSpeakingTimes, setMemberSpeakingTimes] = useState<Record<string, number>>({
    "Alice Chen": 70, // 1:10
    "Marcus Johnson": 125, // 2:05
    "Sarah Williams": 45, // 0:45
    "David Park": 95, // 1:35
  })
  const [newMessage, setNewMessage] = useState("") // Assuming this state variable is used for the message input
  const [newDiscussion, setNewDiscussion] = useState("")
  const [possibleInterventions, setPossibleInterventions] = useState<AIIntervention[]>([])
  const [selectedResource, setSelectedResource] = useState<{
    id: string
    name?: string
    title?: string
    type: "document" | "webpage" | "research" | "video"
    url?: string
    content?: string
    summary: string
    definition?: string
  } | null>(null)
  const [silenceTime, setSilenceTime] = useState(0)
  const [showAIFeedback, setShowAIFeedback] = useState(false)
  const [tRATQuestion, setTRATQuestion] = useState(
    "Based on the assigned readings and your own experience, what are the three biggest challenges students face when trying to use phones and laptops without harming their health (e.g., stress, distractions, sleep problems)? Rank them in order of importance and justify your ranking with evidence and examples.",
  )
  const [thinkingNetwork, setThinkingNetwork] = useState<ThinkingNode[]>([])
  const [userQuestions, setUserQuestions] = useState<
    Array<{
      id: string
      content: string
      timestamp: Date
      author: string
    }>
  >([
    {
      id: "1",
      content: "Is using a laptop late at night worse than using a phone in bed?",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      author: "Alice Chen",
    },
    {
      id: "2",
      content: "How much daily screen time becomes unhealthy for students?",
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      author: "Marcus Johnson",
    },
    {
      id: "3",
      content: "Do blue-light filters actually improve sleep?",
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      author: "Sarah Williams",
    },
    {
      id: "4",
      content: "Do weekend 'digital detox' programs improve concentration long-term?",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      author: "David Park",
    },
  ])
  const [voiceCalibrationComplete, setVoiceCalibrationComplete] = useState(false)
  const [showVoiceCalibrationDialog, setShowVoiceCalibrationDialog] = useState(false) // Corrected state name
  const { user: currentUser, loading, logout, getInitials, getFullName } = useUser() // Added user hook and renamed `user` to `currentUser`

  // Hooks for voice calibration and transcription
  const {
    calibrationComplete: calibrationCompleteHook,
    startCalibration,
    stopCalibration,
    isCalibrating,
    recording,
    countdown,
    calibrationError,
    recognizedSentence,
  } = useVoiceCalibration()

  // Use the recognizedSentence from useVoiceCalibration hook for calibration
  useEffect(() => {
    setVoiceCalibrationComplete(calibrationCompleteHook)
  }, [calibrationCompleteHook])

  const { transcripts, startTranscription, stopTranscription, speakerStats } = useRealTimeTranscription()

  // AI comprehensive intelligent system
  useEffect(() => {
    if (!isDiscussionActive || !aiActiveMode) return

    const aiSystemInterval = setInterval(() => {
      updateKnowledgeBase()
      updateThinkingNetwork()
      generateDiscussionSummary()
      decideAIIntervention()
    }, 8000)

    return () => clearInterval(aiSystemInterval)
  }, [isDiscussionActive, aiActiveMode, discussions, knowledgeBase, thinkingNetwork])

  // Discussion timer and phase management
  useEffect(() => {
    let interval: any
    if (isDiscussionActive) {
      interval = setInterval(() => {
        setDiscussionTime((prev) => {
          const newTime = prev + 1
          // Phase transitions are now based on the derived currentPhase
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isDiscussionActive])

  // Intelligent silence detection
  useEffect(() => {
    let silenceInterval: any
    if (isDiscussionActive && !isListening && transcripts.length === 0) {
      // Only trigger silence if not actively listening and no transcripts
      silenceInterval = setInterval(() => {
        setSilenceTime((prev) => {
          const newTime = prev + 1
          if (newTime >= 15 && aiActiveMode) {
            generateContextualIntervention("silence")
            return 0
          }
          return newTime
        })
      }, 1000)
    } else {
      setSilenceTime(0) // Reset silence time if listening or discussion is not active
    }
    return () => clearInterval(silenceInterval)
  }, [isDiscussionActive, isListening, aiActiveMode, transcripts.length])

  const analyzeLogicalStructure = (content: string) => {
    return {
      hasEvidence: /because|due to|according to|data shows|research indicates|for example|such as/.test(content),
      hasClaim: /I think|I believe|should|must|can|suggest/.test(content),
      hasReasoning: /so|therefore|leads to|results in|thus/.test(content),
      hasCounterargument: /but|however|although|on the contrary|on the other hand/.test(content),
    }
  }

  const analyzeDiscussionQuality = (content: string, logicalStructure?: any): number => {
    let score = 2

    if (logicalStructure) {
      if (logicalStructure.hasEvidence) score += 1
      if (logicalStructure.hasClaim) score += 1
      if (logicalStructure.hasReasoning) score += 1
      if (logicalStructure.hasCounterargument) score += 1
    }

    if (content.length > 30) score += 0.5
    if (content.includes("why") || content.includes("how")) score += 0.5

    return Math.min(Math.round(score), 5)
  }

  const decideAIIntervention = () => {
    const recentQuality =
      discussions.slice(-3).reduce((acc, d) => acc + d.quality, 0) / Math.max(discussions.slice(-3).length, 1)
    const confusionIndicators = discussions.slice(-2).filter((d) => d.thoughtType === "question").length

    if (recentQuality < 3 && Math.random() > 0.7) {
      generateContextualIntervention("depth_needed")
    } else if (confusionIndicators > 1 && Math.random() > 0.8) {
      generateContextualIntervention("logic_clarification")
    } else if (discussions.length > 0 && discussions.length % 8 === 0) {
      generateContextualIntervention("synthesis_time")
    }
  }

  const findConnections = (content: string, existingDiscussions: Discussion[]): string[] => {
    const connections: string[] = []
    const contentKeywords = extractKeywords(content)

    existingDiscussions.forEach((discussion) => {
      const commonKeywords = discussion.keywords.filter((keyword) =>
        contentKeywords.some((ck) => ck.includes(keyword) || keyword.includes(ck)),
      )

      if (commonKeywords.length > 0) {
        connections.push(discussion.id)
      }
    })

    return connections.slice(-3)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const generateAIFeedbackContent = () => {
    const feedbackItems: Array<{
      id: string
      type: string
      title: string
      content: string
      icon: string
    }> = []

    // Participation Balance Feedback
    if (discussions.length > 0) {
      const speakers = new Set(discussions.map((d) => d.speaker))
      const participation = Array.from(speakers).map((speaker) => ({
        speaker,
        count: discussions.filter((d) => d.speaker === speaker).length,
      }))
      const maxContributions = Math.max(...participation.map((p) => p.count))
      const minContributions = Math.min(...participation.map((p) => p.count))
      const isUnbalanced = maxContributions - minContributions > 2

      if (isUnbalanced) {
        feedbackItems.push({
          id: "participation-balance",
          type: "analysis",
          title: "Participation Balance",
          content:
            "The discussion showed some participation imbalances. Consider encouraging quieter members to share their perspectives in future discussions.",
          icon: "⚖️",
        })
      }
    }

    // Evidence Quality Feedback
    if (discussions.length > 0) {
      const evidenceRate = discussions.filter((d) => d.logicalStructure.hasEvidence).length / discussions.length
      if (evidenceRate < 0.4 && discussions.length > 3) {
        feedbackItems.push({
          id: "evidence-quality",
          type: "suggestion",
          title: "Evidence Integration",
          content:
            "Your team could strengthen arguments by connecting more points to the assigned readings and case studies. Consider referencing specific research findings and data.",
          icon: "📚",
        })
      }
    }

    // Discussion Depth Analysis
    if (discussions.length > 0) {
      const avgQuality = discussions.reduce((sum, d) => sum + d.quality, 0) / discussions.length
      if (avgQuality < 3 && discussions.length > 2) {
        feedbackItems.push({
          id: "discussion-depth",
          type: "improvement",
          title: "Discussion Depth",
          content:
            "The discussion could benefit from exploring the \"why\" and \"how\" behind your safety factor rankings. Consider asking probing questions and providing detailed justifications.",
          icon: "🔍",
        })
      }
    }

    // Synthesis Encouragement
    if (discussions.length > 0) {
      const synthesisCount = discussions.filter((d) => d.thoughtType === "synthesis").length
      if (discussions.length > 5 && synthesisCount === 0) {
        feedbackItems.push({
          id: "synthesis-opportunity",
          type: "suggestion",
          title: "Synthesis Opportunity",
          content:
            "Great discussions! Your team had rich conversations but could work on synthesizing different viewpoints into cohesive conclusions and action plans.",
          icon: "🔄",
        })
      }
    }

    // Positive Reinforcement
    if (discussions.length > 0) {
      const highQualityDiscussions = discussions.filter((d) => d.quality >= 4).length
      if (highQualityDiscussions > 0) {
        feedbackItems.push({
          id: "excellent-progress",
          type: "praise",
          title: "Excellent Progress",
          content: `Outstanding work! I identified ${highQualityDiscussions} high-quality argument${highQualityDiscussions > 1 ? "s" : ""} with strong evidence and reasoning. Keep building on these insights!`,
          icon: "⭐",
        })
      }
    }

    // Overall Performance Summary
    if (discussions.length > 0) {
      const totalSpeakingTime = (Object.values(memberSpeakingTimes) as number[]).reduce(
        (sum: number, time: number) => sum + time,
        0,
      )
      const avgSpeakingTime = totalSpeakingTime / teamMembers.length

      feedbackItems.push({
        id: "overall-summary",
        type: "summary",
        title: "Discussion Summary",
        content: `Your team completed a ${Math.floor(discussionTime / 60)}-minute discussion with ${
          discussions.length
        } contributions across ${discussionPhase} phases. Key concepts discussed included: ${[
          ...new Set(discussions.flatMap((d) => d.concepts)),
        ]
          .slice(0, 5)
          .join(", ")}.`,
        icon: "📊",
      })
    }

    return feedbackItems
  }

  const generateContextualIntervention = (triggerType: string) => {
    let intervention: AIIntervention

    switch (triggerType) {
      case "silence":
        intervention = generateSilenceBreaker()
        break
      case "depth_needed":
        intervention = generateDepthGuidance()
        break
      case "knowledge_gap":
        intervention = generateKnowledgeSupport()
        break
      case "logic_clarification":
        intervention = generateLogicClarification()
        break
      case "synthesis_time":
        intervention = generateSynthesisGuidance()
        break
      default:
        intervention = generateGeneralGuidance()
    }

    setAiInterventions((prev) => [...prev.slice(-6), intervention])
  }

  const generateDepthGuidance = (): AIIntervention => {
    return {
      id: Date.now().toString(),
      type: "knowledge_synthesis",
      content: `🎯 **Deeper Analysis**: This safety factor needs more depth. Can you connect it to specific protocols from the readings? What evidence supports ranking this factor above others?`,
      timestamp: new Date(),
      priority: "high",
      relatedKeywords: [],
      resources: [
        {
          id: "res-2",
          title: "Patient Safety Metrics in Home Care",
          type: "research",
          summary: "Peer-reviewed research on measuring and improving patient safety outcomes in home healthcare",
          content:
            "Recent studies show that home healthcare safety requires different metrics and approaches compared to institutional care...",
        },
      ],
      context: {
        triggerType: "depth_needed",
        relatedNodes: [],
      },
    }
  }

  const generateGeneralGuidance = (): AIIntervention => {
    return {
      id: Date.now().toString(),
      type: "process_guidance",
      content: `💭 **Discussion Guidance**: Great points! Consider exploring different perspectives on this issue. What would critics of this approach argue?`,
      timestamp: new Date(),
      priority: "low",
      relatedKeywords: [],
      context: {
        triggerType: "general",
        relatedNodes: [],
      },
    }
  }

  const generateKnowledgeSupport = (): AIIntervention => {
    const relevantConcepts = knowledgeBase.concepts.slice(-2)
    return {
      id: Date.now().toString(),
      type: "resource_provision",
      content: `📚 **Resource Connection**: Based on your discussion, I found relevant materials about home healthcare safety protocols. Click on the resources to explore further evidence for your safety factor rankings.`,
      timestamp: new Date(),
      priority: "medium",
      relatedKeywords: relevantConcepts.map((c) => c.name),
      resources: [
        {
          id: "res-3",
          title: "Technology Solutions for Home Patient Monitoring",
          type: "webpage",
          url: "https://example.com/home-monitoring-tech",
          summary: "Interactive guide on implementing technology solutions for patient safety in home care",
        },
        {
          id: "res-4",
          title: "Case Study: Reducing Medication Errors at Home",
          type: "document",
          summary: "Analysis of successful medication management programs in home healthcare",
          content:
            "This case study examines how structured medication management protocols reduced errors by 60% in home healthcare settings...",
        },
      ],
      context: {
        triggerType: "knowledge_gap",
        relatedNodes: [],
      },
    }
  }

  const generateLogicClarification = (): AIIntervention => {
    return {
      id: Date.now().toString(),
      type: "logic_clarification",
      content: `🧩 **Logic Check**: Let's organize this safety argument: What's your main claim about this safety factor? What evidence supports its ranking? Are there any counterarguments or competing priorities to consider?`,
      timestamp: new Date(),
      priority: "high",
      relatedKeywords: [],
      context: {
        triggerType: "logic_clarification",
        relatedNodes: [],
      },
    }
  }

  const generateSilenceBreaker = (): AIIntervention => {
    const recentNodes = thinkingNetwork.slice(-3)
    const unconnectedConcepts = knowledgeBase.concepts.filter(
      (c) => !recentNodes.some((n) => n.content.includes(c.name)),
    )

    return {
      id: Date.now().toString(),
      type: "process_guidance",
      content:
        unconnectedConcepts.length > 0
          ? `🔗 **Discussion Extension**: I noticed we discussed "${recentNodes[0]?.content.slice(0, 20)}...", which connects to "${unconnectedConcepts[0]?.name}". How might this concept apply to your home healthcare safety ranking?`
          : `🌊 **Thought Development**: Let's build on our discussion. What evidence from the assigned readings supports the safety factors you've identified so far?`,
      timestamp: new Date(),
      priority: "medium",
      relatedKeywords: [],
      resources: [
        {
          id: "res-1",
          title: "Home Healthcare Safety Frameworks",
          type: "document",
          summary: "Evidence-based frameworks for ensuring patient safety in home care environments",
          content:
            "This document outlines various safety frameworks including medication management protocols, caregiver training standards, and emergency response procedures for home healthcare settings...",
        },
      ],
      context: {
        triggerType: "silence",
        relatedNodes: recentNodes.map((n) => n.id),
      },
    }
  }

  const generateSpeechRecognition = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US" // Set language to English

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          // Process final transcript
          handleSpeechResult(finalTranscript)
        } else if (interimTranscript && isListening) {
          // Handle interim results if needed, e.g., for display
          console.log("Interim:", interimTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        // Handle specific errors, e.g., 'no-speech' or 'not-allowed'
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          alert("Microphone permission not granted. Please allow microphone access in your browser settings.")
        } else if (event.error === "no-speech") {
          console.log("No speech detected.")
        }
      }

      recognition.onend = () => {
        console.log("Speech recognition ended.")
        setIsListening(false)
        // If the discussion is active and recognition stops unexpectedly, try to restart it
        if (isDiscussionActive) {
          // Add a small delay before attempting to restart
          setTimeout(() => {
            if (isListening) {
              // Only restart if we are supposed to be listening
              console.log("Attempting to restart recognition after unexpected end.")
              recognition.start()
            }
          }, 1000)
        }
      }
      return recognition
    } else {
      console.error("Speech recognition not supported in this browser.")
      return null
    }
  }

  const recognitionRef = useRef<any>(null) // Initialize ref for speech recognition

  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = generateSpeechRecognition()
  }, []) // Empty dependency array to run only once on mount

  const handleSpeechResult = (transcript: string) => {
    const keywords = extractKeywords(transcript)
    const concepts = extractConcepts(transcript)
    const logicalStructure = analyzeLogicalStructure(transcript)
    const thoughtType = identifyThoughtType(transcript)

    // Randomly select speaker (in actual application, this would be determined by voice recognition)
    const speaker = teamMembers[Math.floor(Math.random() * teamMembers.length)].name

    // Update speaking time (simulated: add 10-30 seconds per speech)
    const speakingDuration = Math.floor(Math.random() * 20) + 10
    setMemberSpeakingTimes((prev) => ({
      ...prev,
      [speaker]: prev[speaker] + speakingDuration,
    }))

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      speaker: speaker,
      content: transcript,
      timestamp: new Date(),
      quality: analyzeDiscussionQuality(transcript, logicalStructure),
      keywords,
      concepts,
      logicalStructure,
      thoughtType,
      connectsTo: findConnections(transcript, discussions),
    }

    setDiscussions((prev) => [...prev, newDiscussion])

    setTimeout(() => {
      processNewDiscussion(newDiscussion)
    }, 1500)
  }

  const processNewDiscussion = (discussion: Discussion) => {
    addToThinkingNetwork(discussion)
    updateKnowledgeFromDiscussion(discussion)

    const interventionNeeded = analyzeInterventionNeed(discussion)
    if (interventionNeeded) {
      generateContextualIntervention(interventionNeeded)
    }
  }

  const addToThinkingNetwork = (discussion: Discussion) => {
    const newNode: ThinkingNode = {
      id: `node-${discussion.id}`,
      type:
        discussion.thoughtType === "question"
          ? "question"
          : discussion.thoughtType === "synthesis"
            ? "conclusion"
            : discussion.concepts.length > 0
              ? "concept"
              : "insight",
      content: discussion.content.slice(0, 50) + "...",
      position: {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300,
      },
      connections: discussion.connectsTo.map((id) => ({
        to: `node-${id}`,
        type:
          discussion.thoughtType === "challenge"
            ? ("contradicts" as const)
            : discussion.thoughtType === "example"
              ? ("examples" as const)
              : discussion.logicalStructure.hasReasoning
                ? ("leads_to" as const)
                : ("supports" as const),
        strength: discussion.quality / 5,
      })),
      discussionIds: [discussion.id],
      timestamp: discussion.timestamp,
      importance: discussion.quality / 5,
    }

    setThinkingNetwork((prev) => [...prev.slice(-15), newNode])
  }

  const updateKnowledgeFromDiscussion = (discussion: Discussion) => {
    setKnowledgeBase((prev) => {
      const newConcepts = discussion.concepts.map((concept) => ({
        id: `concept-${concept}-${Date.now()}`,
        name: concept,
        definition: `Concept extracted from discussion: ${concept}`,
        examples: discussion.thoughtType === "example" ? [discussion.content] : [],
        relatedConcepts: discussion.concepts.filter((c) => c !== concept),
        sourceDiscussions: [discussion.id],
        confidence: discussion.quality / 5,
      }))

      const newInsights =
        discussion.quality >= 4
          ? [
              {
                id: `insight-${Date.now()}`,
                content: discussion.content,
                supportingEvidence: discussion.logicalStructure.hasEvidence ? [discussion.content] : [],
                confidence: discussion.quality / 5,
                timestamp: discussion.timestamp,
              },
            ]
          : []

      return {
        concepts: [...prev.concepts.slice(-10), ...newConcepts],
        relationships: prev.relationships,
        insights: [...prev.insights.slice(-8), ...newInsights],
      }
    })
  }

  const analyzeInterventionNeed = (discussion: Discussion): string | null => {
    if (discussion.quality < 2.5) return "depth_needed"
    if (discussion.concepts.length === 0) return "knowledge_gap"
    if (discussion.thoughtType === "question" && !discussion.logicalStructure.hasReasoning) return "logic_clarification"
    if (discussions.length > 0 && discussions.length % 5 === 0) return "synthesis_time"
    return null
  }

  const extractConcepts = (content: string): string[] => {
    const conceptPatterns = [
      /medication|prescription|dosage|administration|compliance/g,
      /caregiver|family|education|competency/g,
      /safety|risk|hazard|prevention|protocol/g,
      /emergency|response|communication|alert|monitoring/g,
      /infection|hygiene|sanitation|sterile|contamination/g,
      /technology|device|equipment|monitoring|telehealth/g,
    ]

    const concepts: string[] = []
    conceptPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        concepts.push(...matches)
      }
    })

    return [...new Set(concepts)]
  }

  const extractKeywords = (text: string): string[] => {
    const commonWords = [
      "the",
      "is",
      "in",
      "have",
      "and",
      "of",
      "I",
      "you",
      "he",
      "she",
      "we",
      "this",
      "that",
      "will",
      "all",
      "want",
      "can",
      "could",
    ]
    return text
      .split(/[,.!?;\s]+/)
      .filter((word) => word.length > 1 && !commonWords.includes(word.toLowerCase()))
      .slice(0, 6)
  }

  const getInterventionIcon = (type: string) => {
    const icons = {
      socratic_question: <HelpCircle className="w-4 h-4 text-blue-600" />,
      knowledge_synthesis: <Puzzle className="w-4 h-4 text-purple-600" />,
      logic_clarification: <GitBranch className="w-4 h-4 text-orange-600" />,
      resource_provision: <BookOpen className="w-4 h-4 text-green-600" />,
      process_guidance: <Compass className="w-4 h-4 text-indigo-600" />,
      summary_generation: <Archive className="w-4 h-4 text-gray-600" />,
    }
    return icons[type as keyof typeof icons] || <Lightbulb className="w-4 h-4 text-yellow-600" />
  }

  const getPhaseColor = (phase: string) => {
    const colors = {
      opening: "bg-green-100 text-green-800",
      exploration: "bg-blue-100 text-blue-800",
      deepening: "bg-orange-100 text-orange-800",
      synthesis: "bg-purple-100 text-purple-800",
    }
    return colors[phase as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPhaseLabel = (phase: string) => {
    const labels = {
      opening: "Initial Arguments",
      exploration: "Evidence Gathering",
      deepening: "Critical Analysis",
      synthesis: "Final Consensus",
    }
    return labels[phase as keyof typeof labels] || phase
  }

  const getResourceIcon = (type: string) => {
    const icons = {
      document: <FileText className="w-4 h-4" />,
      webpage: <Globe className="w-4 h-4" />,
      research: <BookOpen className="w-4 h-4" />,
      video: <Play className="w-4 h-4" />,
    }
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isDiscussionActive) {
      e.preventDefault() // Prevent default Enter behavior (new line)
      if (newMessage.trim()) {
        const newDiscussion: Discussion = {
          id: Date.now().toString(),
          speaker: "You", // Assuming the user is 'You'
          content: newMessage,
          timestamp: new Date(),
          quality: analyzeDiscussionQuality(newMessage, analyzeLogicalStructure(newMessage)),
          keywords: extractKeywords(newMessage),
          concepts: extractConcepts(newMessage),
          logicalStructure: analyzeLogicalStructure(newMessage),
          thoughtType: identifyThoughtType(newMessage),
          connectsTo: findConnections(newMessage, discussions),
        }
        setDiscussions((prev) => [...prev, newDiscussion])
        setNewMessage("") // Clear the input
        processNewDiscussion(newDiscussion)
      }
    }
  }

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource)
  }

  const identifyThoughtType = (content: string): Discussion["thoughtType"] => {
    if (content.includes("?") || content.includes("why") || content.includes("how")) {
      return "question"
    }
    if (content.includes("for example") || content.includes("such as") || content.includes("case")) {
      return "example"
    }
    if (content.includes("theory") || content.includes("model") || content.includes("framework")) {
      return "theory"
    }
    if (content.includes("but") || content.includes("however") || content.includes("challenge")) {
      return "challenge"
    }
    if (content.includes("summary") || content.includes("synthesis") || content.includes("integration")) {
      return "synthesis"
    }
    return "answer"
  }

  const startDiscussion = async () => {
    if (!voiceCalibrationComplete) {
      alert("请先完成语音校准再开始讨论")
      return
    }

    setIsDiscussionActive(true)
    setIsListening(true)

    try {
      await startTranscription()
      console.log("小组讨论开始，实时转录已启动")
    } catch (error) {
      console.error("Failed to start discussion:", error)
      alert("启动语音识别失败，请重试")
      setIsDiscussionActive(false)
      setIsListening(false)
    }
  }

  const stopDiscussion = async () => {
    setIsDiscussionActive(false)
    setIsListening(false)

    try {
      await stopTranscription()
      console.log("小组讨论结束")
    } catch (error) {
      console.error("Failed to stop discussion:", error)
    }
  }

  // Process new transcripts
  useEffect(() => {
    transcripts.forEach((transcript) => {
      if (transcript.content.trim()) {
        const logicalStructure = analyzeLogicalStructure(transcript.content)
        const quality = analyzeDiscussionQuality(transcript.content, logicalStructure)
        const newDiscussion: Discussion = {
          id: transcript.id,
          speaker: transcript.speaker || `User ${transcript.speakerId}`, // Use speaker name from transcription or fallback
          content: transcript.content,
          timestamp: transcript.timestamp,
          quality: quality,
          keywords: extractKeywords(transcript.content),
          concepts: extractConcepts(transcript.content),
          logicalStructure: logicalStructure,
          thoughtType: identifyThoughtType(transcript.content),
          connectsTo: findConnections(transcript.content, discussions),
        }

        setDiscussions((prev) => {
          // Avoid duplicate entries
          if (prev.find((d) => d.id === newDiscussion.id)) return prev
          return [...prev, newDiscussion]
        })

        // Send to text analysis platform (simulated)
        console.log("Sending to text analysis platform:", {
          content: transcript.content,
          speaker: transcript.speaker,
          speakerId: transcript.speakerId,
          timestamp: transcript.timestamp,
        })
      }
    })
  }, [transcripts, discussions]) // Dependencies include transcripts and current discussions

  const startVoiceCalibration = () => {
    console.log("Opening voice calibration dialog")
    setShowVoiceCalibrationDialog(true)
  }

  const beginCalibration = async () => {
    try {
      const result = await startCalibration()
      if (result?.success) {
        console.log("语音校准成功:", result)
        setTimeout(() => {
          setShowVoiceCalibrationDialog(false)
        }, 2000)
      }
    } catch (error) {
      console.error("语音校准失败:", error)
    }
  }

  // The beginVoiceRecording function from the original code is now managed by the useVoiceCalibration hook.
  // We will use the hook's state and functions instead.

  const stopDiscussionAndReset = () => {
    stopDiscussion()
    // Optionally reset other states here if needed when discussion ends
  }

  const toggleDiscussion = async () => {
    if (!isDiscussionActive) {
      await startDiscussion()
    } else {
      await stopDiscussion()
    }
  }

  const updateKnowledgeBase = () => {
    if (discussions.length === 0) return

    const recentDiscussions = discussions.slice(-5)
    const conceptFrequency = recentDiscussions
      .flatMap((d) => d.concepts)
      .reduce(
        (acc, concept) => {
          acc[concept] = (acc[concept] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    setKnowledgeBase((prev) => ({
      ...prev,
      concepts: prev.concepts.map((concept) => ({
        ...concept,
        confidence: Math.min(concept.confidence + (conceptFrequency[concept.name] || 0) * 0.1, 1),
      })),
    }))
  }

  const updateThinkingNetwork = () => {
    setThinkingNetwork((prev) =>
      prev.map((node) => ({
        ...node,
        importance: Math.min(node.importance + 0.05, 1),
        connections: node.connections.map((conn) => ({
          ...conn,
          strength: Math.min(conn.strength + 0.1, 1),
        })),
      })),
    )
  }

  const generateDiscussionSummary = () => {
    if (discussions.length === 0) return

    const recentDiscussions = discussions.slice(-5)
    const keyPoints = recentDiscussions.filter((d) => d.quality >= 4).map((d) => d.content.slice(0, 50) + "...")

    const unresolved = recentDiscussions
      .filter((d) => d.thoughtType === "question")
      .map((d) => d.content.slice(0, 50) + "...")

    const insights = knowledgeBase.insights.slice(-3).map((i) => i.content.slice(0, 50) + "...")

    setDiscussionSummary({
      phase: discussionPhase,
      keyPoints,
      unresolved,
      insights,
      nextSteps: ["Connect arguments to assigned readings", "Provide more evidence", "Consider counterarguments"],
      knowledgeGaps: knowledgeBase.concepts
        .filter((c) => c.confidence < 0.5)
        .map((c) => c.name)
        .slice(0, 3),
    })
  }

  const sendUserMessage = () => {
    if (newMessage.trim()) {
      const newDiscussion: Discussion = {
        id: Date.now().toString(),
        speaker: "You",
        content: newMessage,
        timestamp: new Date(),
        quality: analyzeDiscussionQuality(newMessage, analyzeLogicalStructure(newMessage)),
        keywords: extractKeywords(newMessage),
        concepts: extractConcepts(newMessage),
        logicalStructure: analyzeLogicalStructure(newMessage),
        thoughtType: identifyThoughtType(newMessage),
        connectsTo: findConnections(newMessage, discussions),
      }
      setDiscussions((prev) => [...prev, newDiscussion])
      setNewMessage("")
      processNewDiscussion(newDiscussion)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-700 flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              Edu AI - Team-Based Learning Platform
            </h1>
            <div className="flex items-center gap-4">
              {/* Voice Calibration Button */}
              <Button
                onClick={startVoiceCalibration}
                variant="outline"
                className={`border-orange-200 hover:bg-orange-50 ${isCalibrating ? "bg-orange-100 border-orange-300" : ""}`}
                disabled={isCalibrating}
              >
                <Mic className="w-4 h-4 mr-2 text-orange-600" />
                <span className={isCalibrating ? "text-orange-700" : "text-orange-600"}>
                  {isCalibrating ? "Calibrating..." : "Voice Setup"}
                </span>
              </Button>

              {/* Combined Start Button */}
              {!isDiscussionActive ? (
                <Button
                  onClick={startDiscussion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 hover:-translate-y-0.5 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  disabled={!voiceCalibrationComplete} // Only enable after calibration
                >
                  <Play className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Start Discussion
                </Button>
              ) : (
                <Button
                  onClick={stopDiscussion} // Use stopDiscussion
                  variant="outline"
                  className="border-red-200 hover:bg-red-50"
                >
                  <Pause className="w-4 h-4 mr-2 text-red-600" />
                  <span className="text-red-600">End Discussion</span>
                </Button>
              )}

              {/* AI Feedback Button - Only clickable when discussion is not active */}
              <Button
                onClick={() => setShowAIFeedback(!showAIFeedback)}
                variant="outline"
                className="bg-gray-50 border-gray-200 text-gray-700"
                disabled={isDiscussionActive}
              >
                <Brain className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-gray-700">AI Feedback</span>
              </Button>

              {/* 用户菜单 */}
              <div className="relative group">
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                {/* 下拉菜单 */}
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    {/* 用户信息 */}
                    <div className="px-3 py-2 border-b border-gray-200 mb-2">
                      <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>

                    <Link href="/profile">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                        <UserIcon className="w-4 h-4" />
                        Profile
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Topic Section */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-600" />
                Course Topic
              </h3>
            </div>
            <p className="text-slate-800">{currentTopic}</p>
          </div>

          {/* tRAT Question */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              tRAT Discussion Question
            </h3>
            <p className="text-blue-900 leading-relaxed">{tRATQuestion}</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Summary & Resources */}
          <div className="col-span-3 space-y-6">
            {/* Summary Section - Real-time and Final (Vertical Layout) */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Archive className="w-5 h-5 text-blue-600" />
                  Discussion Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Real-time Summary */}
                <div>
                  <h4 className="font-medium text-sm mb-3 text-indigo-700">
                    Real-time Progress
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                      <h5 className="text-xs font-medium mb-1 text-green-800">Discussion Progress</h5>
                      <p className="text-xs text-green-700">{discussions.length} contributions made</p>
                      <p className="text-xs text-green-700">Time: {formatTime(discussionTime)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-yellow-100 shadow-sm">
                      <h5 className="text-xs font-medium mb-1 text-yellow-800">Current Focus</h5>
                      <p className="text-xs text-yellow-700">
                        Prioritizing sleep disruption vs. concentration loss vs. notification stress
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final Summary */}
                <div>
                  <h4 className="font-medium text-sm mb-3 text-indigo-700">
                    Final Summary
                  </h4>
                  <div className="space-y-3">
                    {!isDiscussionActive && discussions.length > 0 ? (
                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="text-center text-gray-500 text-xs">
                          Final summary will be generated when<br />
                          tRAT discussion ends
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="text-center text-gray-500 text-xs">
                          Final summary will be generated when<br />
                          tRAT discussion ends
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Resources */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Course Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-indigo-700">Assigned Readings</h5>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs cursor-pointer hover:bg-indigo-50 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📚</div>
                          <span className="text-indigo-800 hover:text-indigo-900">Chapter 7: Screen Time and Student Wellbeing</span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs cursor-pointer hover:bg-indigo-50 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📊</div>
                          <span className="text-indigo-800 hover:text-indigo-900">Research Article: Effects of Night-time Device Use on Sleep Quality</span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs cursor-pointer hover:bg-indigo-50 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📖</div>
                          <span className="text-indigo-800 hover:text-indigo-900">Case Study: University Digital Detox Programs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2 text-indigo-700">AI-Suggested Resources</h5>
                    <div className="space-y-2">
                      {[
                        {
                          id: "resource-1",
                          name: "Tips to Reduce Eye Strain",
                          definition: "Evidence-based methods for minimizing digital eye strain during extended screen use",
                          type: "document",
                          summary: "General advice on eye strain reduction.",
                        },
                        {
                          id: "resource-2",
                          name: "UK Student Mental Health Report (2023)",
                          definition: "Comprehensive report on mental health challenges facing UK university students",
                          type: "document",
                          summary: "Latest research on student mental health trends.",
                        },
                        {
                          id: "resource-3",
                          name: "Digital Wellness Guidelines",
                          definition: "Evidence-based strategies for maintaining digital wellness and healthy technology habits",
                          type: "webpage",
                          summary: "Comprehensive guide to digital wellness practices.",
                        },
                      ].map((resource) => (
                        <div
                          key={resource.id}
                          className="bg-white p-2 rounded border border-indigo-100 text-xs cursor-pointer hover:bg-indigo-50 transition-colors"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-indigo-600">🤖</div>
                            <span className="text-indigo-800">{resource.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - AI Guidance & Resources */}
          <div className="col-span-6">
            <div className="h-full flex flex-col">
              <div className="pb-3 flex-shrink-0">
                <Tabs defaultValue="guidance" className="w-full h-full flex flex-col">
                  <TabsList className="flex w-full justify-between border border-slate-200 bg-gray-50 rounded-md p-1">
                    <TabsTrigger value="guidance" className="flex-1 border border-slate-200 rounded-sm bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-300 px-2 py-1 text-sm mx-1">AI Guidance</TabsTrigger>
                    <TabsTrigger value="resources" className="flex-1 border border-slate-200 rounded-sm bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-300 px-2 py-1 text-sm mx-1">Resources</TabsTrigger>
                    <TabsTrigger value="mindmap" className="flex-1 border border-slate-200 rounded-sm bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-300 px-2 py-1 text-sm mx-1">Mindmap</TabsTrigger>
                  </TabsList>

                  <TabsContent value="guidance" className="mt-4 flex-1">
                    <div className="h-[calc(100vh-200px)] rounded-lg border border-slate-200 p-4">
                      {/* AI Guidance Messages - No Input Box */}
                      <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                          {showAIFeedback ? (
                            <>
                              {/* AI Feedback Content */}
                              <div className="flex gap-3">
                                <Avatar className="w-8 h-8 mt-1">
                                  <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                    <Brain className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-700">Edu AI Feedback</span>
                                    <span className="text-xs text-gray-500">Analysis Complete</span>
                                    <Brain className="w-4 h-4 text-[#4338CA]" />
                                  </div>
                                  <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                    <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                      🧠 <strong>Comprehensive Discussion Analysis</strong>: I've analyzed your team's discussion performance across multiple dimensions. Here's your detailed feedback:
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {generateAIFeedbackContent().map((feedback, index) => (
                                <div key={feedback.id} className="flex gap-3">
                                  <Avatar className="w-8 h-8 mt-1">
                                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                      <span>{feedback.icon}</span>
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-gray-700">{feedback.title}</span>
                                      <span className="text-xs text-gray-500 capitalize">{feedback.type}</span>
                                    </div>
                                    <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                      <div className="text-sm text-gray-800 leading-relaxed">
                                        {feedback.content}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {discussions.length === 0 && (
                                <div className="text-center py-8">
                                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600">No discussion data available for feedback analysis.</p>
                                  <p className="text-gray-500 text-sm mt-2">Complete a discussion to receive AI feedback.</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {aiInterventions.length === 0 ? (
                                <div className="space-y-4 pr-4">
                                  {/* 示例AI干预 */}
                                  <div className="flex gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                        <Brain className="w-4 h-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-indigo-600">Edu AI</span>
                                        <span className="text-xs text-gray-500">Example</span>
                                        <Compass className="w-4 h-4 text-indigo-600" />
                                      </div>
                                      <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                        <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                          🎯 <strong>Discussion Starter</strong>: Welcome to today's tRAT on healthy technology use. To start, what do you think are the biggest health-related challenges caused by using phones or laptops too much? Please share your top three and explain why, using readings or personal examples.
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs font-medium text-gray-600">Suggested Resources:</p>
                                          <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                              <FileText className="w-4 h-4" />
                                              <span className="ml-1">WHO Recommendations on Screen Time</span>
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                              <BookOpen className="w-4 h-4" />
                                              <span className="ml-1">UK Student Mental Health Report (2023)</span>
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                        <Brain className="w-4 h-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-indigo-600">Edu AI</span>
                                        <span className="text-xs text-gray-500">Example</span>
                                        <HelpCircle className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                        <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                          🤔 <strong>Open Group Prompt</strong>: Some of you have highlighted sleep disruption as a main concern. Do others think that stress from constant notifications could be even more disruptive? Why or why not?
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                        <Brain className="w-4 h-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-indigo-600">Edu AI</span>
                                        <span className="text-xs text-gray-500">Example</span>
                                        <Puzzle className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                        <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                          🔄 <strong>Knowledge Synthesis</strong>: So far you've identified three recurring themes: sleep, stress from notifications, and reduced concentration. How do these interact with each other? For example, does reducing screen time automatically improve wellbeing, or is the type of use more important?
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs font-medium text-gray-600">Related Concepts:</p>
                                          <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                              Sleep Disruption
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                              Notification Stress
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                              Concentration Loss
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                        <Brain className="w-4 h-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-indigo-600">Edu AI</span>
                                        <span className="text-xs text-gray-500">Example</span>
                                        <BookOpen className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                        <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                          📚 <strong>Resource Provision</strong>: Based on your discussion about digital wellness, I found some relevant research that might strengthen your arguments. The studies show interesting patterns in how different technology use habits affect student health and academic performance.
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs font-medium text-gray-600">Suggested Resources:</p>
                                          <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                              <Globe className="w-4 h-4" />
                                              <span className="ml-1">Digital Wellness Guidelines</span>
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-center py-4 border-t">
                                    <p className="text-sm text-gray-500">
                                      These are examples of how I'll guide your discussion. Start the tRAT discussion to see
                                      real-time AI assistance!
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {aiInterventions.map((intervention, index) => (
                                    <div key={intervention.id} className="flex gap-3">
                                      <Avatar className="w-8 h-8 mt-1">
                                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                          <Brain className="w-4 h-4" />
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm text-indigo-600">Edu AI</span>
                                          <span className="text-xs text-gray-500">
                                            {intervention.timestamp.toLocaleTimeString()}
                                          </span>
                                          {getInterventionIcon(intervention.type)}
                                        </div>
                                        <div className="rounded-lg p-3 border border-slate-200" style={{backgroundColor: '#F9FAFB'}}>
                                          <div className="text-sm text-gray-800 leading-relaxed mb-3">
                                            {intervention.content.split("**").map((part, idx) =>
                                              idx % 2 === 1 ? (
                                                <strong key={idx} className="text-indigo-700">
                                                  {part}
                                                </strong>
                                              ) : (
                                                part
                                              ),
                                            )}
                                          </div>
                                          {/* Resource buttons */}
                                          {intervention.resources && intervention.resources.length > 0 && (
                                            <div className="space-y-2">
                                              <p className="text-xs font-medium text-gray-600">Suggested Resources:</p>
                                              <div className="flex flex-wrap gap-2">
                                                {intervention.resources.map((resource) => (
                                                  <Button
                                                    key={resource.id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-8 bg-transparent"
                                                    onClick={() => handleResourceClick(resource)}
                                                  >
                                                    {getResourceIcon(resource.type)}
                                                    <span className="ml-1">{resource.title || resource.name}</span>
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                  </Button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-4 flex-1">
                    <div className="h-[calc(100vh-200px)] bg-gray-50 rounded-lg border border-slate-200 p-4">
                      {selectedResource ? (
                        <div className="h-full">
                          <div className="flex items-center gap-2 mb-4">
                            {getResourceIcon(selectedResource.type)}
                            <h3 className="font-medium">{selectedResource.title || selectedResource.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResource(null)}
                              className="ml-auto"
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="bg-white rounded border border-slate-200 p-4 h-full overflow-auto">
                            {selectedResource.url ? (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">{selectedResource.summary}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(selectedResource.url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open External Link
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-800">{selectedResource.summary}</p>
                                <div className="text-sm text-gray-700 leading-relaxed">{selectedResource.content}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Click on a resource from AI guidance to view it here</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="mindmap" className="mt-4 flex-1">
                    <div className="h-[calc(100vh-200px)] rounded-lg border relative overflow-hidden" style={{backgroundColor: '#F9FAFB'}}>
                      {thinkingNetwork.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">
                              Argument network will be built as the discussion progresses
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full p-4">
                          {thinkingNetwork.map((node) => (
                            <div key={node.id} className="absolute">
                              <div
                                className={`rounded-lg shadow-md p-3 border-2 transform -translate-x-1/2 -translate-y-1/2 max-w-32 ${
                                  node.type === "question"
                                    ? "bg-blue-100 border-blue-300"
                                    : node.type === "concept"
                                      ? "bg-green-100 border-green-300"
                                      : node.type === "insight"
                                        ? "bg-slate-100 border-slate-300"
                                        : node.type === "connection"
                                          ? "bg-purple-100 border-purple-300"
                                          : "bg-gray-100 border-gray-300"
                                }`}
                                style={{
                                  left: node.position.x,
                                  top: node.position.y,
                                  opacity: 0.7 + node.importance * 0.3,
                                }}
                              >
                                <div className="text-xs font-medium mb-1">
                                  {node.type === "question"
                                    ? "❓"
                                    : node.type === "concept"
                                      ? "💡"
                                      : node.type === "insight"
                                        ? "💎"
                                        : node.type === "connection"
                                          ? "🔗"
                                          : "📝"}
                                  {node.type}
                                </div>
                                <div className="text-xs text-gray-700">{node.content}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Dashboard */}
          <div className="col-span-3 space-y-6">
            {/* Dashboard */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Team Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Member Participation Metrics */}
                  <div>
                    <h5 className="text-sm font-medium mb-3 text-indigo-700">Member Participation</h5>
                    <div className="space-y-3">
                      {teamMembers.map((member) => {
                        const memberDiscussions = discussions.filter((d) => d.speaker === member.name)
                        const speakingTime = memberSpeakingTimes[member.name] || 0

                        return (
                          <div key={member.id} className="bg-white p-3 rounded border border-indigo-100 ">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">{member.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm flex-1 text-indigo-800">{member.name}</span>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  memberDiscussions.length > 0 &&
                                  Date.now() - memberDiscussions[memberDiscussions.length - 1]?.timestamp.getTime() <
                                    60000
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                                <div className="font-medium text-blue-600">{memberDiscussions.length}</div>
                                <div className="text-blue-700">Speeches</div>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                                <div className="font-medium text-green-600">
                                  {Math.floor(speakingTime / 60)}:{(speakingTime % 60).toString().padStart(2, "0")}
                                </div>
                                <div className="text-green-700">Speaking Time</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Questions Section */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Display Added Questions */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-indigo-700">Your Questions</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {userQuestions.length === 0 ? (
                        <div className="text-xs text-gray-500 text-center py-2 bg-white rounded border border-indigo-100 ">
                          No questions added yet
                        </div>
                      ) : (
                        userQuestions.map((question) => (
                          <div key={question.id} className="bg-white p-2 rounded border border-indigo-100 text-xs ">
                            <div className="text-indigo-800">{question.content}</div>
                            <div className="text-indigo-600 text-xs mt-1">{question.timestamp.toLocaleTimeString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Question Input */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-indigo-700">Add a Question</h5>
                    <div className="space-y-2">
                      <Input
                        placeholder="Type your question or thought here..."
                        value={currentQuestionInput}
                        onChange={(e) => setCurrentQuestionInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && isDiscussionActive) {
                            const newQuestion = {
                              id: Date.now().toString(),
                              content: currentQuestionInput,
                              timestamp: new Date(),
                              author: "You",
                            }
                            setUserQuestions((prev) => [...prev, newQuestion])
                            setCurrentQuestionInput("")
                          }
                        }}
                        className="text-sm border-indigo-200 focus:border-indigo-300"
                      />
                      <Button
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => {
                          if (currentQuestionInput.trim()) {
                            const newQuestion = {
                              id: Date.now().toString(),
                              content: currentQuestionInput,
                              timestamp: new Date(),
                              author: "You",
                            }
                            setUserQuestions((prev) => [...prev, newQuestion])
                            setCurrentQuestionInput("")
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                      <p className="text-xs text-indigo-600">
                        Add questions or thoughts without interrupting the discussion
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voice Calibration Dialog */}
        <Dialog open={showVoiceCalibrationDialog} onOpenChange={setShowVoiceCalibrationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Voice Calibration Setup
              </DialogTitle>
              <DialogDescription className="text-left">
                To help AI identify different team members during discussion, please record the following sentence clearly:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Sentence to record */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-blue-900 text-center leading-relaxed">
                  "Hello, this is my voice for the team-based learning discussion on home healthcare safety."
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Instructions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Speak clearly and at normal volume</li>
                  <li>• Recording will last for 10 seconds</li>
                  <li>• Repeat the sentence 1-2 times during recording</li>
                  <li>• Ensure you're in a quiet environment</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVoiceCalibrationDialog(false)
                    stopCalibration() // Stop calibration if dialog is closed
                  }}
                  disabled={isCalibrating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={beginCalibration}
                  disabled={isCalibrating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCalibrating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Recording... ({countdown}s)
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
              {/* 显示校准结果 */}
              {calibrationError && (
                <div className="text-red-500 text-sm text-center">{calibrationError}</div>
              )}

              {calibrationCompleteHook && (
                <div className="text-green-600 text-sm text-center">
                  ✅ 语音校准成功！识别内容: {recognizedSentence}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}