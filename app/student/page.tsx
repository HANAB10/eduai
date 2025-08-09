"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import {
  Users,
  Lightbulb,
  BookOpen,
  Mic,
  Play,
  Pause,
  Brain,
  Network,
  HelpCircle,
  GitBranch,
  Compass,
  Archive,
  Puzzle,
  ExternalLink,
  FileText,
  Globe,
  Plus,
  Settings,
  User,
} from "lucide-react"

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
    title: string
    type: "document" | "webpage" | "research" | "video"
    url?: string
    content?: string
    summary: string
  }>
  context: {
    triggerType: "silence" | "confusion" | "depth_needed" | "synthesis_time" | "knowledge_gap" | "user_message" | "logic_clarification" | "general" | "discussion_start"
    relatedNodes: string[]
  }
}

interface DiscussionSummary {
  phase: string
  keyPoints: string[]
  unresolved: string[]
  insights: string[]
  nextSteps: string[]
  knowledgeGaps: string[]
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

interface Resource {
  id: string
  title: string
  type: "document" | "webpage" | "research" | "video"
  url?: string
  content?: string
  summary: string
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export default function EduMindAI() {
  const [isDiscussionActive, setIsDiscussionActive] = useState(false)
  const [discussionTime, setDiscussionTime] = useState(0)
  const [currentTopic, setCurrentTopic] = useState("Home Healthcare Management: Quality and Safety")
  const [tRATQuestion, setTRATQuestion] = useState(
    "Based on the assigned readings and case studies, what are the three most critical factors for ensuring patient safety in home healthcare settings? Rank them in order of importance and justify your ranking with evidence from the literature and real-world examples.",
  )
  const [isListening, setIsListening] = useState(false)
  const [silenceTime, setSilenceTime] = useState(0)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [thinkingNetwork, setThinkingNetwork] = useState<ThinkingNode[]>([])
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
    concepts: [],
    relationships: [],
    insights: [],
  })
  const [aiInterventions, setAiInterventions] = useState<AIIntervention[]>([])
  const [discussionSummary, setDiscussionSummary] = useState<DiscussionSummary>({
    phase: "opening",
    keyPoints: [],
    unresolved: [],
    insights: [],
    nextSteps: [],
    knowledgeGaps: [],
  })
  const [discussionPhase, setDiscussionPhase] = useState<"opening" | "exploration" | "deepening" | "synthesis">(
    "opening",
  )
  const [aiActiveMode, setAiActiveMode] = useState(true)
  const recognitionRef = useRef<any>(null)
  const [isVoiceCalibrating, setIsVoiceCalibrating] = useState(false)
  const [voiceCalibrationComplete, setVoiceCalibrationComplete] = useState(false)
  const [showVoiceCalibrationDialog, setShowVoiceCalibrationDialog] = useState(false)
  const [memberSpeakingTimes, setMemberSpeakingTimes] = useState<Record<string, number>>({
    Alice: 0,
    Bob: 0,
    Carol: 0,
    David: 0,
  })
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [userQuestions, setUserQuestions] = useState<
    Array<{
      id: string
      content: string
      timestamp: Date
      author: string
    }>
  >([])
  const [currentQuestionInput, setCurrentQuestionInput] = useState("")
  const [newMessage, setNewMessage] = useState(""); // Assuming this state variable is used for the message input
  const [showAIFeedback, setShowAIFeedback] = useState(false)

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Alice",
      avatar: "/placeholder.svg?height=40&width=40",
      participationLevel: 85,
      lastSpoke: null,
      speakingTime: 0,
      thinkingPatterns: { analytical: 0.8, creative: 0.6, critical: 0.7, practical: 0.9 },
      contributionTypes: { questions: 0, examples: 0, theories: 0, challenges: 0 },
    },
    {
      id: "2",
      name: "Bob",
      avatar: "/placeholder.svg?height=40&width=40",
      participationLevel: 72,
      lastSpoke: null,
      speakingTime: 0,
      thinkingPatterns: { analytical: 0.9, creative: 0.8, critical: 0.6, practical: 0.7 },
      contributionTypes: { questions: 0, examples: 0, theories: 0, challenges: 0 },
    },
    {
      id: "3",
      name: "Carol",
      avatar: "/placeholder.svg?height=40&width=40",
      participationLevel: 68,
      lastSpoke: null,
      speakingTime: 0,
      thinkingPatterns: { analytical: 0.7, creative: 0.9, critical: 0.8, practical: 0.6 },
      contributionTypes: { questions: 0, examples: 0, theories: 0, challenges: 0 },
    },
    {
      id: "4",
      name: "David",
      avatar: "/placeholder.svg?height=40&width=40",
      participationLevel: 91,
      lastSpoke: null,
      speakingTime: 0,
      thinkingPatterns: { analytical: 0.6, creative: 0.7, critical: 0.9, practical: 0.8 },
      contributionTypes: { questions: 0, examples: 0, theories: 0, challenges: 0 },
    },
  ]

  // Initialize speech recognition (React 18 compatible)
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          handleSpeechResult(finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

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
  }, [isDiscussionActive, aiActiveMode, discussions])

  // Discussion timer and phase management
  useEffect(() => {
    let interval: any
    if (isDiscussionActive) {
      interval = setInterval(() => {
        setDiscussionTime((prev) => {
          const newTime = prev + 1
          if (newTime === 300) setDiscussionPhase("exploration")
          if (newTime === 600) setDiscussionPhase("deepening")
          if (newTime === 900) setDiscussionPhase("synthesis")
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isDiscussionActive])

  // Intelligent silence detection
  useEffect(() => {
    let silenceInterval: any
    if (isDiscussionActive && !isListening) {
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
      setSilenceTime(0)
    }
    return () => clearInterval(silenceInterval)
  }, [isDiscussionActive, isListening, aiActiveMode])

  const analyzeLogicalStructure = (content: string) => {
    return {
      hasEvidence: /because|due to|according to|data shows|research indicates|for example|such as/.test(content),
      hasClaim: /I think|I believe|should|must|can|suggest/.test(content),
      hasReasoning: /so|therefore|leads to|results in|thus/.test(content),
      hasCounterargument: /but|however|although|on the contrary|on the other hand/.test(content),
    }
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

  const extractConcepts = (content: string): string[] => {
    const conceptPatterns = [
      /medication|prescription|dosage|administration|compliance/g,
      /caregiver|family|training|education|competency/g,
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

  const handleSpeechResult = (transcript: string) => {
    const keywords = extractKeywords(transcript)
    const concepts = extractConcepts(transcript)
    const logicalStructure = analyzeLogicalStructure(transcript)
    const thoughtType = identifyThoughtType(transcript)

    // 随机选择说话者（在实际应用中会通过语音识别确定）
    const speaker = teamMembers[Math.floor(Math.random() * teamMembers.length)].name

    // 更新发言时长（模拟：每次发言增加10-30秒）
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

  const generateSynthesisGuidance = (): AIIntervention => {
    const keyInsights = knowledgeBase.insights.slice(-3)
    return {
      id: Date.now().toString(),
      type: "summary_generation",
      content: `🔄 **Synthesis Time**: Let's synthesize what we've discussed about home healthcare safety. I've identified key insights: ${keyInsights.map((i) => i.content.slice(0, 30)).join("; ")}... How do these connect to create your final ranking of the three most critical safety factors?`,
      timestamp: new Date(),
      priority: "high",
      relatedKeywords: [],
      context: {
        triggerType: "synthesis_time",
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
      const speakers = new Set(discussions.map(d => d.speaker))
      const participation = Array.from(speakers).map(speaker => ({
        speaker,
        count: discussions.filter(d => d.speaker === speaker).length
      }))
      const maxContributions = Math.max(...participation.map(p => p.count))
      const minContributions = Math.min(...participation.map(p => p.count))
      const isUnbalanced = maxContributions - minContributions > 2

      if (isUnbalanced) {
        feedbackItems.push({
          id: 'participation-balance',
          type: 'analysis',
          title: 'Participation Balance',
          content: 'The discussion showed some participation imbalances. Consider encouraging quieter members to share their perspectives in future discussions.',
          icon: '⚖️'
        })
      }
    }

    // Evidence Quality Feedback
    if (discussions.length > 0) {
      const evidenceRate = discussions.filter(d => d.logicalStructure.hasEvidence).length / discussions.length
      if (evidenceRate < 0.4 && discussions.length > 3) {
        feedbackItems.push({
          id: 'evidence-quality',
          type: 'suggestion',
          title: 'Evidence Integration',
          content: 'Your team could strengthen arguments by connecting more points to the assigned readings and case studies. Consider referencing specific research findings and data.',
          icon: '📚'
        })
      }
    }

    // Discussion Depth Analysis
    if (discussions.length > 0) {
      const avgQuality = discussions.reduce((sum, d) => sum + d.quality, 0) / discussions.length
      if (avgQuality < 3 && discussions.length > 2) {
        feedbackItems.push({
          id: 'discussion-depth',
          type: 'improvement',
          title: 'Discussion Depth',
          content: 'The discussion could benefit from exploring the "why" and "how" behind your safety factor rankings. Consider asking probing questions and providing detailed justifications.',
          icon: '🔍'
        })
      }
    }

    // Synthesis Encouragement
    if (discussions.length > 0) {
      const synthesisCount = discussions.filter(d => d.thoughtType === "synthesis").length
      if (discussions.length > 5 && synthesisCount === 0) {
        feedbackItems.push({
          id: 'synthesis-opportunity',
          type: 'suggestion',
          title: 'Synthesis Opportunity',
          content: 'Great discussions! Your team had rich conversations but could work on synthesizing different viewpoints into cohesive conclusions and action plans.',
          icon: '🔄'
        })
      }
    }

    // Positive Reinforcement
    if (discussions.length > 0) {
      const highQualityDiscussions = discussions.filter(d => d.quality >= 4).length
      if (highQualityDiscussions > 0) {
        feedbackItems.push({
          id: 'excellent-progress',
          type: 'praise',
          title: 'Excellent Progress',
          content: `Outstanding work! I identified ${highQualityDiscussions} high-quality argument${highQualityDiscussions > 1 ? 's' : ''} with strong evidence and reasoning. Keep building on these insights!`,
          icon: '⭐'
        })
      }
    }

    // Overall Performance Summary
    if (discussions.length > 0) {
      const totalSpeakingTime = (Object.values(memberSpeakingTimes) as number[]).reduce((sum: number, time: number) => sum + time, 0)
      const avgSpeakingTime = totalSpeakingTime / teamMembers.length

      feedbackItems.push({
        id: 'overall-summary',
        type: 'summary',
        title: 'Discussion Summary',
        content: `Your team completed a ${Math.floor(discussionTime / 60)}-minute discussion with ${discussions.length} contributions across ${discussionPhase} phases. Key concepts discussed included: ${[...new Set(discussions.flatMap(d => d.concepts))].slice(0, 5).join(', ')}.`,
        icon: '📊'
      })
    }

    return feedbackItems
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

  const analyzeDiscussionQuality = (content: string, logicalStructure: any): number => {
    let score = 2

    if (logicalStructure.hasEvidence) score += 1
    if (logicalStructure.hasClaim) score += 1
    if (logicalStructure.hasReasoning) score += 1
    if (logicalStructure.hasCounterargument) score += 1

    if (content.length > 30) score += 0.5
    if (content.includes("why") || content.includes("how")) score += 0.5

    return Math.min(Math.round(score), 5)
  }

  const startDiscussion = () => {
    setIsDiscussionActive(true)
    setDiscussionTime(0)
    setDiscussionPhase("opening")

    // 同时开始录音
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    } else {
      setIsListening(true)
    }

    setTimeout(() => {
      const openingIntervention: AIIntervention = {
        id: Date.now().toString(),
        type: "process_guidance",
        content: `🎯 **tRAT Discussion Started**: Welcome to your Team Readiness Assurance Test discussion on home healthcare safety! I'm here to guide your conversation and provide relevant resources. Begin by sharing your initial ranking of the three most critical safety factors, and remember to support your arguments with evidence from the assigned readings and case studies.`,
        timestamp: new Date(),
        priority: "high",
        relatedKeywords: [],
        context: {
          triggerType: "discussion_start",
          relatedNodes: [],
        },
      }
      setAiInterventions([openingIntervention])
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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

  const getPhaseColor = (phase: string) => {
    const colors = {
      opening: "bg-green-100 text-green-800",
      exploration: "bg-blue-100 text-blue-800",
      deepening: "bg-orange-100 text-orange-800",
      synthesis: "bg-purple-100 text-purple-800",
    }
    return colors[phase as keyof typeof colors] || "bg-gray-100 text-gray-800"
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

  const startVoiceCalibration = () => {
    setShowVoiceCalibrationDialog(true)
  }

  const [calibrationCountdown, setCalibrationCountdown] = useState(0)

  const beginVoiceRecording = () => {
    setIsVoiceCalibrating(true)
    setCalibrationCountdown(10)

    // 启动倒计时
    const countdownInterval = setInterval(() => {
      setCalibrationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    if (recognitionRef.current) {
      recognitionRef.current.start()

      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        setIsVoiceCalibrating(false)
        setVoiceCalibrationComplete(true)
        setShowVoiceCalibrationDialog(false)
        setCalibrationCountdown(0)
        alert("Voice calibration complete! AI can now identify speakers.")
      }, 10000)
    } else {
      // 模拟语音校准
      setTimeout(() => {
        setIsVoiceCalibrating(false)
        setVoiceCalibrationComplete(true)
        setShowVoiceCalibrationDialog(false)
        setCalibrationCountdown(0)
        alert("Voice calibration complete! AI can now identify speakers.")
      }, 10000)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource)
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
      e.preventDefault(); // Prevent default Enter behavior (new line)
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
        };
        setDiscussions((prev) => [...prev, newDiscussion]);
        setNewMessage(""); // Clear the input
        processNewDiscussion(newDiscussion);
      }
    }
  };

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
              {!voiceCalibrationComplete && (
                <Button
                  onClick={startVoiceCalibration}
                  variant="outline"
                  className={`border-orange-200 hover:bg-orange-50 ${isVoiceCalibrating ? "bg-orange-100 border-orange-300" : ""}`}
                  disabled={isVoiceCalibrating}
                >
                  <Mic className="w-4 h-4 mr-2 text-orange-600" />
                  <span className={isVoiceCalibrating ? "text-orange-700" : "text-orange-600"}>
                    {isVoiceCalibrating ? "Calibrating..." : "Voice Setup"}
                  </span>
                </Button>
              )}

              {/* Combined Start Button */}
              {!isDiscussionActive ? (
                <Button
                  onClick={startDiscussion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                  disabled={!voiceCalibrationComplete}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start tRAT Discussion
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsDiscussionActive(false)
                    if (recognitionRef.current) {
                      recognitionRef.current.stop()
                    }
                    setIsListening(false)
                  }}
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
                <Avatar className="w-10 h-10 border-2 border-indigo-200 cursor-pointer hover:border-indigo-300 transition-colors">
                  <AvatarFallback className="bg-indigo-100">
                    <User className="w-5 h-5 text-indigo-600" />
                  </AvatarFallback>
                </Avatar>

                {/* 下拉菜单 */}
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link href="/profile">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </div>
                    </Link>
                    <Link href="/settings">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer">
                      Sign Out
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
                    <div className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                      <h5 className="text-xs font-medium mb-1 text-blue-800">Current Phase</h5>
                      <p className="text-xs text-blue-700">{getPhaseLabel(discussionPhase)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                      <h5 className="text-xs font-medium mb-1 text-green-800">Discussion Progress</h5>
                      <p className="text-xs text-green-700">{discussions.length} contributions made</p>
                      <p className="text-xs text-green-700">Time: {formatTime(discussionTime)}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-yellow-100 shadow-sm">
                      <h5 className="text-xs font-medium mb-1 text-yellow-800">Current Focus</h5>
                      <p className="text-xs text-yellow-700">
                        {discussionSummary.keyPoints.length > 0
                          ? discussionSummary.keyPoints[discussionSummary.keyPoints.length - 1]
                          : "Building initial arguments for home healthcare safety factor rankings"}
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
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs ">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📚</div>
                          <span className="text-indigo-800">Chapter 12: Home Healthcare Quality Standards</span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs ">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📊</div>
                          <span className="text-indigo-800">Research Article: Patient Safety in Home Care Settings</span>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-indigo-100 text-xs ">
                        <div className="flex items-center gap-2">
                          <div className="text-indigo-600">📖</div>
                          <span className="text-indigo-800">Case Study: Technology Integration in Home Healthcare</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2 text-indigo-700">AI-Suggested Resources</h5>
                    <ScrollArea className="h-24">
                      <div className="space-y-2 pr-2">
                        {knowledgeBase.concepts.length === 0 ? (
                          <div className="text-sm text-gray-500 bg-white border border-gray-200 p-4 rounded-lg text-center">
                            Resources will appear during discussion
                          </div>
                        ) : (
                          knowledgeBase.concepts.slice(-5).map((concept, index) => (
                            <div key={index} className="bg-white p-2 rounded border border-indigo-100 text-xs ">
                              <div className="flex items-start gap-2">
                                <div className="text-indigo-600 mt-0.5">🤖</div>
                                <div>
                                  <span className="font-medium text-indigo-800">{concept.name}:</span>
                                  <span className="text-indigo-700"> {concept.definition.slice(0, 40)}...</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
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
                                      🎯 <strong>Discussion Starter</strong>: Welcome to your tRAT discussion on home
                                      healthcare management! I'll help guide your conversation by asking probing
                                      questions, providing relevant resources, and helping you build stronger arguments.
                                      Let's begin by having each member share their initial ranking of the three most
                                      critical safety factors.
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-gray-600">Suggested Resources:</p>
                                      <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                          <FileText className="w-4 h-4" />
                                          <span className="ml-1">Home Care Safety Guidelines</span>
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                          <BookOpen className="w-4 h-4" />
                                          <span className="ml-1">Patient Monitoring Technologies</span>
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
                                      🤔 <strong>Socratic Question</strong>: I notice you mentioned that "medication
                                      management is the top priority." Can you think of situations where this might not
                                      be the case? How do factors like patient mobility, family caregiver training, and
                                      emergency response systems interact with medication safety?
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
                                      🔄 <strong>Knowledge Synthesis</strong>: Great discussion so far! I'm seeing
                                      connections between three key themes: medication safety, caregiver competency, and
                                      emergency preparedness. How do these factors work together to create a
                                      comprehensive safety framework for home healthcare?
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-gray-600">Related Concepts:</p>
                                      <div className="flex flex-wrap gap-1">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                          Medication Management
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                          Caregiver Training
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                          Emergency Response
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
                                      📚 <strong>Resource Provision</strong>: Based on your discussion about infection
                                      control in home settings, I found some relevant research that might strengthen
                                      your arguments. The studies show interesting patterns in how different safety
                                      protocols work across various home healthcare scenarios.
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-gray-600">Suggested Resources:</p>
                                      <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                                          <Globe className="w-4 h-4" />
                                          <span className="ml-1">WHO Home Care Safety Standards</span>
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
                                                <span className="ml-1">{resource.title}</span>
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
                            <h3 className="font-medium">{selectedResource.title}</h3>
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
                  onClick={() => setShowVoiceCalibrationDialog(false)}
                  disabled={isVoiceCalibrating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={beginVoiceRecording}
                  disabled={isVoiceCalibrating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isVoiceCalibrating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Recording... ({calibrationCountdown}s)
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}