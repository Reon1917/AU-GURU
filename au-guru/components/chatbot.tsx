"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { Send, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  categories?: string[]
  tokenEstimate?: number
}

// Shared component styles
const messageStyles = {
  bot: "bg-muted/50 text-foreground border border-border/50",
  user: "bg-primary text-primary-foreground",
  container: "max-w-[85%] break-words"
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm the AU Smart Assistant. I can help you with information about Assumption University's programs, admissions, campus life, and more. What would you like to know?",
      isBot: true,
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        isBot: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputValue,
          }),
        })

        const data = await response.json()
        
        if (response.ok) {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            isBot: true,
            timestamp: new Date(),
            categories: data.categories,
            tokenEstimate: data.tokenEstimate
          }
          setMessages(prev => [...prev, botResponse])
        } else {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact AU directly at +66 2 719 1919.",
            isBot: true,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorResponse])
        }
      } catch (error) {
        console.error('Chat error:', error)
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact AU directly at +66 2 719 1919.",
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorResponse])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const suggestions = [
    "Tell me about undergraduate programs",
    "How do I apply?",
    "What's campus life like?",
    "Scholarship information"
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-background border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-red-500/20">
                  <AvatarImage src="/api/placeholder/48/48" alt="AU Bot" />
                  <AvatarFallback className="bg-red-500 text-white font-semibold">
                    AU
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold text-foreground">AU Smart Assistant</h1>
                  <p className="text-sm text-muted-foreground">Assumption University of Thailand</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 hover:bg-accent"
                  suppressHydrationWarning
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              {message.isBot && (
                <Avatar className="h-10 w-10 shrink-0 mt-1 ring-2 ring-red-500/20">
                  <AvatarImage src="/api/placeholder/40/40" alt="AU Bot" />
                  <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                    AU
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`${messageStyles.container} ${message.isBot ? "text-left" : "text-right"}`}>
                <div
                  className={`inline-block rounded-2xl px-5 py-3 shadow-sm ${
                    message.isBot
                      ? messageStyles.bot
                      : messageStyles.user
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 px-2">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="h-10 w-10 shrink-0 mt-1 ring-2 ring-red-500/20">
                <AvatarImage src="/api/placeholder/40/40" alt="AU Bot" />
                <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                  AU
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[85%] text-left">
                <div className="inline-block rounded-2xl px-5 py-3 bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AU Smart Assistant is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent transition-colors text-xs px-3 py-1.5 border border-border/50"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about AU programs, admissions, campus life..."
                className="flex-1 h-12 px-4 rounded-xl border-border/50 focus:border-primary transition-colors"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSend()
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0 shadow-sm"
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}