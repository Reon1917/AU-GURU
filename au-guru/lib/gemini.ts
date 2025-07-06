import { GoogleGenAI } from "@google/genai"

const SYSTEM_PROMPT = `You are AU Smart Assistant for Assumption University Thailand. Be helpful, friendly, and conversational.

KNOWLEDGE BASE:
CONTACTS: Hua Mak Campus (592/3 Ramkhamhaeng 24 Rd, Bangkok, +66 2 719 1919), Suvarnabhumi Campus (88 Moo.8, Bang Na-Trad Km.26, Samutprakarn, +66 2 723 2323). Website: au.edu

PROGRAMS: Business (BBA, Marketing, Finance, International Business), Arts (Business English/French), Music (Management, Performance), Science & Technology (Computer Science, ICT), Communication Arts (Mass Comm, Advertising, PR), Architecture & Design, Engineering (Electrical, Mechanical), Biotechnology, Nursing, Law, Medicine. Graduate: MBA, Masters, Doctoral programs available.

TUITION: Undergraduate 112K-350K THB/year, Graduate 200K-550K THB, Additional fees: Matriculation 23.5K THB, Health insurance 3.65K THB.

HISTORY: Founded 1938 as Assumption Commercial College by Brothers of St. Gabriel. Full university status 1990. 100K+ students from 100+ countries. English instruction hallmark.

CONVERSATION RULES:
1. Remember previous questions and build on them naturally
2. Only answer AU-related questions with warmth and personality
3. Be conversational but concise (2-4 sentences typically)
4. Reference previous context when relevant
5. For unrelated questions: "I focus on AU information - what would you like to know about our programs, campus, or admissions?"

Stay focused on AU but be engaging and remember our conversation.`

interface ConversationMessage {
  role: "user" | "model"
  parts: [{ text: string }]
}

export class AUGeminiClient {
  private client: GoogleGenAI
  private conversationHistory: ConversationMessage[] = []
  private maxHistoryLength = 10 // Keep last 5 exchanges (10 messages)
  private maxTokensPerMessage = 150 // Rough estimate for context management

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required")
    }
    
    this.client = new GoogleGenAI({
      apiKey: apiKey
    })

    // Initialize with system context
    this.conversationHistory.push({
      role: "model",
      parts: [{ text: SYSTEM_PROMPT }]
    })
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  private trimConversationHistory(): void {
    // Always keep the system prompt (first message)
    if (this.conversationHistory.length > this.maxHistoryLength + 1) {
      // Keep system prompt + last maxHistoryLength messages
      this.conversationHistory = [
        this.conversationHistory[0], // System prompt
        ...this.conversationHistory.slice(-this.maxHistoryLength)
      ]
    }
  }

  private buildContextualPrompt(message: string): ConversationMessage[] {
    // Add user message to history
    const userMessage: ConversationMessage = {
      role: "user",
      parts: [{ text: message }]
    }

    // Create conversation context
    const contextMessages = [...this.conversationHistory, userMessage]
    
    // Trim if needed
    if (contextMessages.length > this.maxHistoryLength + 2) {
      return [
        contextMessages[0], // System prompt
        ...contextMessages.slice(-this.maxHistoryLength - 1) // Recent history + current message
      ]
    }

    return contextMessages
  }

  async generateResponse(message: string): Promise<string> {
    try {
      // Build conversation context
      const conversationContext = this.buildContextualPrompt(message)
      
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationContext,
        config: {
          maxOutputTokens: 300, // Keep responses focused
          temperature: 0.7, // Slightly creative but consistent
        }
      })
      
      const responseText = response.text || "I apologize, but I couldn't generate a response. Please try again."
      
      // Add both user message and bot response to history
      this.conversationHistory.push({
        role: "user",
        parts: [{ text: message }]
      })
      
      this.conversationHistory.push({
        role: "model", 
        parts: [{ text: responseText }]
      })

      // Trim history if it gets too long
      this.trimConversationHistory()

      return responseText
    } catch (error) {
      console.error("Gemini API Error:", error)
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact AU directly at +66 2 719 1919."
    }
  }

  async generateStreamingResponse(message: string) {
    try {
      const conversationContext = this.buildContextualPrompt(message)
      
      const response = await this.client.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: conversationContext,
        config: {
          maxOutputTokens: 300,
          temperature: 0.7,
        }
      })
      
      // Note: For streaming, you'd need to collect the full response
      // to add it to conversation history after streaming completes
      return response
    } catch (error) {
      console.error("Gemini Streaming Error:", error)
      throw error
    }
  }

  // Helper method to get conversation stats
  getConversationStats() {
    return {
      messageCount: this.conversationHistory.length,
      estimatedTokens: this.conversationHistory.reduce((total, msg) => 
        total + this.estimateTokens(msg.parts[0].text), 0
      )
    }
  }

  // Method to reset conversation (useful for new chat sessions)
  resetConversation() {
    this.conversationHistory = [{
      role: "model",
      parts: [{ text: SYSTEM_PROMPT }]
    }]
  }
}