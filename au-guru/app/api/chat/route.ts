import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { SmartKnowledgeBase } from "@/lib/smart-knowledge-base"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
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

    // Get contextual knowledge based on the query
    const contextualKnowledge = SmartKnowledgeBase.getContextualKnowledge(message)
    
    // Initialize Gemini client
    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!
    })

    // Generate response with dynamic context
    const result = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${contextualKnowledge.prompt}\n\nUser: ${message}` }]
        }
      ]
    })
    
    const response = result.text || "I apologize, but I couldn't generate a response. Please try again."

    return NextResponse.json({
      response,
      categories: contextualKnowledge.categories,
      tokenEstimate: contextualKnowledge.tokenEstimate,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}