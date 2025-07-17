import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Textarea } from './ui/textarea'
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  Sparkles
} from 'lucide-react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface ChatAreaProps {
  user: User
  workspace: string
  conversationId: string | null
  onNewConversation: () => void
  sidebarCollapsed: boolean
}

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  userId?: string
  userName?: string
  isStreaming?: boolean
}

export function ChatArea({ 
  user, 
  workspace, 
  conversationId, 
  onNewConversation,
  sidebarCollapsed 
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Load conversation messages
  useEffect(() => {
    if (conversationId) {
      // Mock messages for existing conversation
      const mockMessages: Message[] = [
        {
          id: '1',
          type: 'user',
          content: 'Can you help us brainstorm ideas for our new product launch?',
          timestamp: '10:30 AM',
          userId: user.id,
          userName: user.displayName || user.email
        },
        {
          id: '2',
          type: 'ai',
          content: 'I\'d be happy to help you brainstorm product launch ideas! Let me suggest a few strategic approaches:\n\n**1. Multi-channel Launch Strategy**\n- Social media teasers and countdown campaigns\n- Influencer partnerships and early access programs\n- Email marketing to existing customers\n- PR outreach to relevant industry publications\n\n**2. Community-Driven Launch**\n- Beta testing program with feedback collection\n- User-generated content campaigns\n- Community challenges and contests\n- Ambassador program for power users\n\n**3. Educational Content Marketing**\n- Behind-the-scenes development stories\n- Problem-solution focused content\n- Tutorial videos and demos\n- Webinars and live Q&A sessions\n\nWhat type of product are you launching? This will help me provide more targeted suggestions.',
          timestamp: '10:31 AM'
        },
        {
          id: '3',
          type: 'user',
          content: 'It\'s a productivity app for remote teams. We want to focus on the collaboration features.',
          timestamp: '10:35 AM',
          userId: 'user2',
          userName: 'Sarah Chen'
        }
      ]
      setMessages(mockMessages)
    } else {
      setMessages([])
    }
  }, [conversationId, user])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user.id,
      userName: user.displayName || user.email
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      // Stream AI response
      await blink.ai.streamText(
        { 
          prompt: inputValue,
          model: 'gpt-4o-mini'
        },
        (chunk) => {
          setStreamingMessage(prev => prev + chunk)
        }
      )

      // Add the complete AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: streamingMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
      setStreamingMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (!conversationId && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">New Conversation</h1>
            <Badge variant="secondary" className="text-xs">
              {workspace}
            </Badge>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl text-center space-y-8">
            <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-medium text-foreground">
                Start a new conversation
              </h2>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Ask questions, brainstorm ideas, or get help with your projects. Your team can join and collaborate in real-time.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 notion-hover">
                <h3 className="font-medium mb-2 text-sm">💡 Brainstorming</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Help us brainstorm marketing ideas for our new product launch"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 notion-hover">
                <h3 className="font-medium mb-2 text-sm">🔍 Problem Solving</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "We're facing challenges with user retention. What strategies should we consider?"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 notion-hover">
                <h3 className="font-medium mb-2 text-sm">📊 Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Analyze these user feedback trends and suggest improvements"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 notion-hover">
                <h3 className="font-medium mb-2 text-sm">⚡ Quick Help</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Explain this technical concept to our non-technical team members"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything or start a discussion with your team..."
                className="min-h-[56px] pr-12 resize-none border-border/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-foreground hover:bg-foreground/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {conversationId ? 'Product Strategy Discussion' : 'New Conversation'}
            </h1>
            <p className="text-sm text-muted-foreground">3 participants • Active now</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {workspace}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className="flex items-start space-x-3">
                <Avatar className="w-7 h-7 mt-0.5">
                  <AvatarFallback className={`text-sm font-medium ${
                    message.type === 'ai' 
                      ? 'bg-foreground text-background' 
                      : message.type === 'system'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    {message.type === 'ai' ? (
                      <Bot className="w-4 h-4" />
                    ) : message.type === 'system' ? (
                      '!'
                    ) : (
                      message.userName?.[0] || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-sm text-foreground">
                      {message.type === 'ai' ? 'AI Assistant' : message.userName || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  
                  <div className={`text-[15px] leading-relaxed ${
                    message.type === 'system' ? 'text-muted-foreground italic' : 'text-foreground'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-7 px-2 text-xs notion-hover"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs notion-hover">
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs notion-hover">
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs notion-hover">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Streaming message */}
          {streamingMessage && (
            <div className="group">
              <div className="flex items-start space-x-3">
                <Avatar className="w-7 h-7 mt-0.5">
                  <AvatarFallback className="bg-foreground text-background text-sm font-medium">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-sm text-foreground">AI Assistant</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                  <div className="text-[15px] leading-relaxed text-foreground">
                    <div className="whitespace-pre-wrap">{streamingMessage}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[56px] pr-12 resize-none border-border/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-foreground hover:bg-foreground/90"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}