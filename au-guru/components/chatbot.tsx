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
            timestamp: new Date()
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" alt="AU Bot" />
                <AvatarFallback className="bg-red-500 text-white text-sm font-medium">
                  AU
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-foreground">AU Smart Assistant</h1>
                <p className="text-sm text-muted-foreground">Assumption University of Thailand</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
                suppressHydrationWarning
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            {message.isBot && (
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarImage src="/api/placeholder/32/32" alt="AU Bot" />
                <AvatarFallback className="bg-red-500 text-white text-xs font-medium">
                  AU
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[80%] ${message.isBot ? "text-left" : "text-right"}`}>
              <div
                className={`inline-block rounded-lg px-4 py-2 ${
                  message.isBot
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 shrink-0 mt-1">
              <AvatarImage src="/api/placeholder/32/32" alt="AU Bot" />
              <AvatarFallback className="bg-red-500 text-white text-xs font-medium">
                AU
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] text-left">
              <div className="inline-block rounded-lg px-4 py-2 bg-muted text-foreground">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">AU Smart Assistant is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 space-y-4">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-accent text-xs px-3 py-1"
                onClick={() => setInputValue(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about AU programs, admissions, campus life..."
              className="flex-1"
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
              className="shrink-0"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}