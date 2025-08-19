
// 教育资源数据库
export interface EducationalResource {
  id: string
  title: string
  type: "document" | "webpage" | "research" | "video" | "report"
  url?: string
  summary: string
  content?: string
  tags: string[]
  relevantTopics: string[]
  accessDate?: string
}

export const educationalResources: EducationalResource[] = [
  {
    id: "who-screen-time-2023",
    title: "WHO Recommendations on Screen Time",
    type: "document",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
    summary: "World Health Organization guidelines on screen time limits for children and adolescents, including recommendations for healthy digital habits.",
    content: "The WHO recommends that children aged 2-4 years should have no more than 1 hour of screen time per day, and children under 2 should have no screen time at all. For school-age children and adolescents, the focus should be on ensuring that recreational screen time does not interfere with adequate sleep (9-11 hours for 5-13 year olds, 8-10 hours for 14-17 year olds) and physical activity (at least 60 minutes of moderate to vigorous physical activity daily).",
    tags: ["WHO", "screen time", "health guidelines", "children", "adolescents"],
    relevantTopics: ["digital wellness", "sleep health", "physical activity", "technology use"],
    accessDate: "2024-08-19"
  },
  {
    id: "uk-student-mental-health-2023",
    title: "UK Student Mental Health Report (2023)",
    type: "report",
    url: "https://www.advance-he.ac.uk/knowledge-hub/student-mental-health-and-wellbeing-insight-survey-2023",
    summary: "Comprehensive report on mental health challenges facing UK university students, including the impact of digital technology on wellbeing.",
    content: "The 2023 UK Student Mental Health Report reveals that 78% of students report experiencing mental health challenges, with digital overwhelm being a significant contributing factor. Key findings include: 65% of students report that social media negatively impacts their mental health, 72% experience anxiety from constant notifications, and 58% struggle with sleep disruption due to evening screen use. The report recommends digital wellness education, screen-free study spaces, and institutional support for healthy technology use.",
    tags: ["UK", "students", "mental health", "university", "wellbeing", "digital impact"],
    relevantTopics: ["student wellbeing", "digital wellness", "mental health", "university life"],
    accessDate: "2024-08-19"
  },
  {
    id: "digital-wellness-guidelines-2024",
    title: "Digital Wellness Guidelines",
    type: "webpage",
    url: "https://www.commonsensemedia.org/digital-wellness",
    summary: "Evidence-based strategies for maintaining digital wellness and healthy technology habits for students and educators.",
    content: "Digital wellness involves creating intentional practices around technology use to support overall wellbeing. Key strategies include: 1) Setting boundaries - Use app timers and 'do not disturb' modes during study and sleep hours. 2) Creating tech-free zones - Designate bedrooms and study areas as device-free spaces. 3) Practicing mindful consumption - Be intentional about what content you consume and how it affects your mood. 4) Regular digital detoxes - Take planned breaks from social media and non-essential technology. 5) Prioritizing face-to-face interactions - Balance online communication with in-person relationships.",
    tags: ["digital wellness", "technology habits", "student guidance", "mental health"],
    relevantTopics: ["digital wellness", "technology balance", "study habits", "sleep hygiene"],
    accessDate: "2024-08-19"
  },
  {
    id: "sleep-technology-research-2024",
    title: "The Impact of Blue Light on Student Sleep Patterns",
    type: "research",
    url: "https://www.sleepfoundation.org/how-sleep-works/blue-light-and-sleep",
    summary: "Research findings on how blue light from digital devices affects melatonin production and sleep quality in students.",
    content: "Recent studies show that blue light exposure from digital devices can suppress melatonin production by up to 23%, significantly impacting sleep quality. For students, this translates to: delayed sleep onset (taking 15-30 minutes longer to fall asleep), reduced REM sleep quality, and increased daytime fatigue affecting academic performance. Recommendations include using blue light filters after sunset, maintaining a 2-meter distance from screens, and implementing a 'digital sunset' 1-2 hours before bedtime.",
    tags: ["blue light", "sleep", "melatonin", "students", "academic performance"],
    relevantTopics: ["sleep health", "technology impact", "academic performance", "circadian rhythm"],
    accessDate: "2024-08-19"
  },
  {
    id: "notification-stress-study-2024",
    title: "Notification Overload and Student Stress Levels",
    type: "research",
    url: "https://www.apa.org/science/about/psa/2017/10/smartphone-stress",
    summary: "American Psychological Association study on how constant notifications contribute to stress and anxiety in college students.",
    content: "APA research indicates that college students receive an average of 70-80 notifications per day, with each interruption requiring 3-5 minutes to refocus on academic tasks. Key findings: students who reduce notifications by 50% show a 25% improvement in focus and 20% reduction in reported stress levels. The study recommends batching notifications, using focus modes during study sessions, and practicing 'notification hygiene' by curating which apps can send alerts.",
    tags: ["notifications", "stress", "anxiety", "focus", "productivity"],
    relevantTopics: ["stress management", "productivity", "attention", "technology management"],
    accessDate: "2024-08-19"
  },
  {
    id: "concentration-digital-media-2024",
    title: "Digital Media and Attention Span in Higher Education",
    type: "research",
    url: "https://www.educause.edu/research-and-publications/research/digital-media-and-attention",
    summary: "EDUCAUSE study on how digital media consumption affects concentration and learning outcomes in university students.",
    content: "This comprehensive study of 15,000 university students found that heavy digital media use (>6 hours daily) correlates with a 40% reduction in sustained attention capacity. Students report difficulty reading for more than 10-15 minutes without checking devices. However, the study also identified effective interventions: structured study sessions with device management, active learning techniques that incorporate technology purposefully, and metacognitive training to help students recognize attention patterns.",
    tags: ["concentration", "attention span", "digital media", "learning outcomes", "university"],
    relevantTopics: ["learning effectiveness", "attention management", "study strategies", "cognitive health"],
    accessDate: "2024-08-19"
  }
]

// 根据主题搜索相关资源
export function getResourcesByTopic(topic: string): EducationalResource[] {
  return educationalResources.filter(resource => 
    resource.relevantTopics.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
    resource.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
  )
}

// 根据讨论内容获取推荐资源
export function getRecommendedResources(discussionContent: string, concepts: string[]): EducationalResource[] {
  const keywords = [...concepts, ...discussionContent.toLowerCase().split(' ')]
  const recommendations: { resource: EducationalResource; score: number }[] = []

  educationalResources.forEach(resource => {
    let score = 0
    
    // 检查标签匹配
    resource.tags.forEach(tag => {
      if (keywords.some(keyword => keyword.includes(tag.toLowerCase()))) {
        score += 2
      }
    })
    
    // 检查主题匹配
    resource.relevantTopics.forEach(topic => {
      if (keywords.some(keyword => keyword.includes(topic.toLowerCase()))) {
        score += 3
      }
    })
    
    // 检查标题和摘要匹配
    const contentToCheck = (resource.title + ' ' + resource.summary).toLowerCase()
    keywords.forEach(keyword => {
      if (contentToCheck.includes(keyword.toLowerCase()) && keyword.length > 3) {
        score += 1
      }
    })
    
    if (score > 0) {
      recommendations.push({ resource, score })
    }
  })

  // 按分数排序并返回前3个
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.resource)
}

// 获取特定资源
export function getResourceById(id: string): EducationalResource | undefined {
  return educationalResources.find(resource => resource.id === id)
}

// 预定义的资源集合，用于AI干预
export const predefinedResourceSets = {
  sleepAndTechnology: [
    "who-screen-time-2023",
    "sleep-technology-research-2024",
    "digital-wellness-guidelines-2024"
  ],
  studentMentalHealth: [
    "uk-student-mental-health-2023",
    "notification-stress-study-2024",
    "digital-wellness-guidelines-2024"
  ],
  concentrationAndFocus: [
    "concentration-digital-media-2024",
    "notification-stress-study-2024",
    "digital-wellness-guidelines-2024"
  ]
}

export function getResourceSet(setName: keyof typeof predefinedResourceSets): EducationalResource[] {
  const resourceIds = predefinedResourceSets[setName]
  return resourceIds.map(id => getResourceById(id)).filter(Boolean) as EducationalResource[]
}
