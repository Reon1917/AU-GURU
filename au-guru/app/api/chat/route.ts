import { NextRequest, NextResponse } from "next/server"
import { AUGeminiClient } from "@/lib/gemini"

// In-memory session storage (in production, use Redis or database)
const conversationSessions = new Map<string, AUGeminiClient>()

// Clean up old sessions (run periodically)
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const sessionTimestamps = new Map<string, number>()

function cleanupOldSessions() {
  const now = Date.now()
  for (const [sessionId, timestamp] of sessionTimestamps.entries()) {
    if (now - timestamp > SESSION_TIMEOUT) {
      conversationSessions.delete(sessionId)
      sessionTimestamps.delete(sessionId)
    }
  }
}

function getOrCreateSession(sessionId: string): AUGeminiClient {
  // Cleanup old sessions periodically
  if (Math.random() < 0.1) { // 10% chance to trigger cleanup
    cleanupOldSessions()
  }

  let client = conversationSessions.get(sessionId)
  
  if (!client) {
    client = new AUGeminiClient(process.env.GEMINI_API_KEY!)
    conversationSessions.set(sessionId, client)
  }
  
  sessionTimestamps.set(sessionId, Date.now())
  return client
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get or create conversation session
    const client = getOrCreateSession(currentSessionId)
    const response = await client.generateResponse(message)
    
    // Get conversation stats for debugging/monitoring
    const stats = client.getConversationStats()

    return NextResponse.json({
      response,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      conversationStats: {
        messageCount: stats.messageCount,
        estimatedTokens: stats.estimatedTokens
      }
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}

// Optional: Add endpoint to reset conversation
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (sessionId && conversationSessions.has(sessionId)) {
      const client = conversationSessions.get(sessionId)!
      client.resetConversation()
      
      return NextResponse.json({
        message: "Conversation reset successfully",
        sessionId
      })
    }
    
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Reset API Error:", error)
    return NextResponse.json(
      { error: "Failed to reset conversation" },
      { status: 500 }
    )
  }
}