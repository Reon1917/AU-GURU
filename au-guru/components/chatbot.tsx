"use client"

import { useState, useEffect, useRef } from "react"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

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
    <div className="h-screen bg-background flex flex-col">
      {/* Header - Fixed */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-11 w-11 ring-2 ring-red-500/20">
                <AvatarImage src="/api/placeholder/44/44" alt="AU Bot" />
                <AvatarFallback className="bg-red-500 text-white font-semibold">
                  AU
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <h1 className="text-xl font-semibold text-foreground">AU Smart Assistant</h1>
                <p className="text-sm text-muted-foreground">Assumption University of Thailand</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 hover:bg-accent transition-colors"
                suppressHydrationWarning
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={messagesContainerRef}
          className="h-full overflow-y-auto scroll-smooth"
        >
          <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-5 ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                {message.isBot && (
                  <Avatar className="h-10 w-10 shrink-0 mt-1 ring-2 ring-red-500/15">
                    <AvatarImage src="/api/placeholder/40/40" alt="AU Bot" />
                    <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                      AU
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${message.isBot ? "text-left" : "text-right"}`}>
                  <div
                    className={`inline-block rounded-3xl px-6 py-4 shadow-sm ${
                      message.isBot
                        ? messageStyles.bot
                        : messageStyles.user
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 px-3">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-5 justify-start">
                <Avatar className="h-10 w-10 shrink-0 mt-1 ring-2 ring-red-500/15">
                  <AvatarImage src="/api/placeholder/40/40" alt="AU Bot" />
                  <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                    AU
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] text-left">
                  <div className="inline-block rounded-3xl px-6 py-4 bg-muted/60 border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AU Smart Assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed */}
      <div className="border-t border-border bg-background/80 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-5xl mx-auto p-8 space-y-6">
          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2.5">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent/80 transition-all duration-200 text-xs px-4 py-2 border border-border/30 hover:border-border/60"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about AU programs, admissions, campus life..."
              className="flex-1 h-14 px-6 text-base rounded-2xl border-border/50 focus:border-primary/60 transition-all duration-200 bg-background/50"
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
              className="h-14 w-14 rounded-2xl shrink-0 shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}