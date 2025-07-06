import auContacts from "@/data/au_contacts.json"
import auFaculties from "@/data/au_faculties.json"
import auHistory from "@/data/au_history.json"
import auTuitions from "@/data/au_tuitions.json"

// Define knowledge categories with their keywords
export const KNOWLEDGE_CATEGORIES = {
  contacts: {
    keywords: ["contact", "phone", "address", "location", "campus", "where", "find", "reach", "call", "visit", "email", "website"],
    data: auContacts
  },
  faculties: {
    keywords: ["program", "course", "study", "major", "faculty", "school", "degree", "bachelor", "master", "graduate", "undergraduate", "engineering", "business", "arts", "science", "technology", "communication", "architecture", "design", "nursing", "law", "medicine", "biotechnology", "music"],
    data: auFaculties
  },
  history: {
    keywords: ["history", "founded", "established", "background", "about", "origin", "when", "started", "old", "tradition", "heritage", "gabriel", "brothers", "college"],
    data: auHistory
  },
  tuitions: {
    keywords: ["tuition", "fee", "cost", "price", "expensive", "cheap", "pay", "payment", "money", "scholarship", "financial", "afford", "budget", "matriculation", "insurance"]
, 
    data: auTuitions
  }
} as const

export type KnowledgeCategory = keyof typeof KNOWLEDGE_CATEGORIES

// Query classifier that determines relevant categories
export class QueryClassifier {
  static classifyQuery(query: string): KnowledgeCategory[] {
    const normalizedQuery = query.toLowerCase()
    const relevantCategories: KnowledgeCategory[] = []

    // Check each category for keyword matches
    for (const [category, config] of Object.entries(KNOWLEDGE_CATEGORIES)) {
      const hasMatch = config.keywords.some(keyword => 
        normalizedQuery.includes(keyword)
      )
      
      if (hasMatch) {
        relevantCategories.push(category as KnowledgeCategory)
      }
    }

    // If no specific category is detected, include basic info (contacts + faculties)
    if (relevantCategories.length === 0) {
      relevantCategories.push('contacts', 'faculties')
    }

    return relevantCategories
  }

  // Get confidence scores for each category
  static getQueryScores(query: string): Record<KnowledgeCategory, number> {
    const normalizedQuery = query.toLowerCase()
    const scores: Record<string, number> = {}

    for (const [category, config] of Object.entries(KNOWLEDGE_CATEGORIES)) {
      const matchCount = config.keywords.filter(keyword => 
        normalizedQuery.includes(keyword)
      ).length
      
      scores[category] = matchCount / config.keywords.length
    }

    return scores as Record<KnowledgeCategory, number>
  }
}

// Smart knowledge base that loads relevant data
export class SmartKnowledgeBase {
  static getRelevantData(categories: KnowledgeCategory[]) {
    const relevantData: Record<string, any> = {}
    
    categories.forEach(category => {
      relevantData[category] = KNOWLEDGE_CATEGORIES[category].data
    })
    
    return relevantData
  }

  // Generate a focused system prompt based on relevant data
  static generateContextPrompt(categories: KnowledgeCategory[], relevantData: Record<string, any>): string {
    let contextInfo = ""

    // Add base instruction
    let prompt = `You are AU Smart Assistant for Assumption University Thailand. Be helpful, friendly, and concise (2-3 sentences max).

AVAILABLE KNOWLEDGE:`

    // Add relevant data sections with error handling
    if (categories.includes('contacts') && relevantData.contacts) {
      try {
        const contacts = relevantData.contacts
        prompt += `

CONTACT INFORMATION:
- Main Website: ${contacts.main_website || 'au.edu'}
- Campuses:
  • Hua Mak Campus: ${contacts.campuses?.[0]?.address || 'Bangkok'}, Phone: ${contacts.campuses?.[0]?.phone || '+66 2 719 1919'}
  • Suvarnabhumi Campus: ${contacts.campuses?.[1]?.address || 'Samutprakarn'}, Phone: ${contacts.campuses?.[1]?.phone || '+66 2 723 2323'}`
      } catch (error) {
        console.error('Error processing contacts data:', error)
      }
    }

    if (categories.includes('faculties') && relevantData.faculties) {
      try {
        const faculties = relevantData.faculties
        const undergradSchools = faculties.faculties?.undergraduate?.map((school: any) => school.name).join(', ') || 'Business, Engineering, Computer Science, Arts'
        prompt += `

ACADEMIC PROGRAMS:
- Undergraduate Schools: ${undergradSchools}
- Popular Programs: Business Administration, Computer Science, Engineering, Communication Arts, Architecture, Nursing, Law, Medicine
- Graduate Programs: Masters and Doctoral degrees available in Business, Science & Technology, Biotechnology, Human Sciences`
      } catch (error) {
        console.error('Error processing faculties data:', error)
      }
    }

    if (categories.includes('tuitions') && relevantData.tuitions) {
      try {
        const tuitions = relevantData.tuitions
        const ugMin = tuitions.tuition_fees_thb?.undergraduate?.domestic_students?.annual_fee_range?.min?.toLocaleString() || '112,000'
        const ugMax = tuitions.tuition_fees_thb?.undergraduate?.domestic_students?.annual_fee_range?.max?.toLocaleString() || '350,000'
        const gradMin = tuitions.tuition_fees_thb?.graduate?.masters_programs?.annual_fee_range?.min?.toLocaleString() || '200,000'
        const gradMax = tuitions.tuition_fees_thb?.graduate?.mba_programs?.total_fee_range?.max?.toLocaleString() || '550,000'
        const matriculation = tuitions.tuition_fees_thb?.undergraduate?.domestic_students?.additional_fees?.matriculation_fee?.toLocaleString() || '23,500'
        const insurance = tuitions.tuition_fees_thb?.undergraduate?.domestic_students?.additional_fees?.health_insurance?.toLocaleString() || '3,650'
        
        prompt += `

TUITION FEES (THB):
- Undergraduate: ${ugMin}-${ugMax} per year
- Graduate/MBA: ${gradMin}-${gradMax} per year
- Additional Fees: Matriculation ${matriculation} THB, Health Insurance ${insurance} THB`
      } catch (error) {
        console.error('Error processing tuitions data:', error)
      }
    }

    if (categories.includes('history') && relevantData.history) {
      try {
        const history = relevantData.history
        const founded = history.history?.origins?.registration_year || '1938'
        const originalName = history.history?.origins?.original_institution || 'Assumption Commercial College'
        const universityEvent = history.history?.origins?.notable_dates?.find((d: any) => d.year === 1990)?.event || 'Granted full university status'
        const founder = history.history?.origins?.founder || 'Brothers of St. Gabriel'
        const totalStudents = history.history?.origins?.student_body?.total_students?.toLocaleString() || '100,000'
        const internationalInfo = history.history?.origins?.student_body?.international_students || 'over 100 countries'
        const philosophy = history.history?.origins?.philosophy || 'Open, international community with moral integrity'
        
        prompt += `

UNIVERSITY HISTORY:
- Founded: ${founded} as ${originalName}
- University Status: ${universityEvent}
- Founded by: ${founder}
- Students: ${totalStudents}+ students from ${internationalInfo}
- Philosophy: ${philosophy}`
      } catch (error) {
        console.error('Error processing history data:', error)
      }
    }

    prompt += `

INSTRUCTIONS:
1. Only answer AU-related questions using the above information
2. Be concise (2-3 sentences maximum)
3. For unrelated questions: "I can only help with AU information about programs, admissions, campus life, fees, and contact details. What would you like to know about AU?"
4. If you need more specific information, ask for clarification
5. Always be helpful and direct

EXAMPLES:
Q: "What programs do you offer?"
A: "AU offers undergraduate programs in Business, Engineering, Computer Science, Communication Arts, Architecture, Nursing, Law, and Medicine. We also have graduate MBA, Masters, and Doctoral programs. Which area interests you?"

Q: "How much is tuition?"
A: "Undergraduate tuition is 112,000-350,000 THB per year. Graduate programs range from 200,000-550,000 THB per year, plus additional fees."

Stay focused on AU information only.`

    return prompt
  }

  // Main method to get contextual knowledge for a query
  static getContextualKnowledge(query: string) {
    const relevantCategories = QueryClassifier.classifyQuery(query)
    const relevantData = this.getRelevantData(relevantCategories)
    const contextPrompt = this.generateContextPrompt(relevantCategories, relevantData)
    
    return {
      categories: relevantCategories,
      data: relevantData,
      prompt: contextPrompt,
      tokenEstimate: Math.ceil(contextPrompt.length / 4) // Rough token estimate
    }
  }
}