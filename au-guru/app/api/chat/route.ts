import { NextRequest, NextResponse } from "next/server"
import { AUGeminiClient } from "@/lib/gemini"

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

    const client = new AUGeminiClient(process.env.GEMINI_API_KEY!)
    const response = await client.generateResponse(message)

    return NextResponse.json({
      response,
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