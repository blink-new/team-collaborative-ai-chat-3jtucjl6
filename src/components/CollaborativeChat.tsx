import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Textarea } from './ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  Send, 
  Bot, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  Sparkles,
  Reply,
  Heart,
  Smile,
  Users,
  Eye
} from 'lucide-react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface CollaborativeChatProps {
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
  userEmail?: string
  isStreaming?: boolean
  parentMessageId?: string
  reactions?: MessageReaction[]
}

interface MessageReaction {
  emoji: string
  users: { id: string; name: string }[]
  count: number
}

interface TypingUser {
  id: string
  name: string
  timestamp: number
}

interface OnlineUser {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'busy'
  lastSeen?: number
}

export function CollaborativeChat({ 
  user, 
  workspace, 
  conversationId, 
  onNewConversation,
  sidebarCollapsed 
}: CollaborativeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Initialize realtime collaboration
  useEffect(() => {
    if (!conversationId) return

    let channel: any = null

    const setupRealtime = async () => {
      try {
        channel = blink.realtime.channel(`conversation-${conversationId}`)
        
        await channel.subscribe({
          userId: user.id,
          metadata: { 
            displayName: user.displayName || user.email,
            email: user.email,
            status: 'online'
          }
        })

        // Listen for new messages
        channel.onMessage((message: any) => {
          if (message.type === 'new_message') {
            const newMessage: Message = {
              id: message.data.id,
              type: message.data.messageType,
              content: message.data.content,
              timestamp: new Date(message.data.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              userId: message.userId,
              userName: message.metadata?.displayName,
              userEmail: message.metadata?.email,
              parentMessageId: message.data.parentMessageId,
              reactions: message.data.reactions || []
            }
            
            setMessages(prev => [...prev, newMessage])
          } else if (message.type === 'typing_start') {
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.id !== message.userId)
              return [...filtered, {
                id: message.userId,
                name: message.metadata?.displayName || 'Someone',
                timestamp: Date.now()
              }]
            })
          } else if (message.type === 'typing_stop') {
            setTypingUsers(prev => prev.filter(u => u.id !== message.userId))
          } else if (message.type === 'message_reaction') {
            setMessages(prev => prev.map(msg => {
              if (msg.id === message.data.messageId) {
                const reactions = msg.reactions || []
                const existingReaction = reactions.find(r => r.emoji === message.data.emoji)
                
                if (existingReaction) {
                  const userExists = existingReaction.users.some(u => u.id === message.userId)
                  if (userExists) {
                    // Remove reaction
                    existingReaction.users = existingReaction.users.filter(u => u.id !== message.userId)
                    existingReaction.count = existingReaction.users.length
                    if (existingReaction.count === 0) {
                      return { ...msg, reactions: reactions.filter(r => r.emoji !== message.data.emoji) }
                    }
                  } else {
                    // Add reaction
                    existingReaction.users.push({
                      id: message.userId,
                      name: message.metadata?.displayName || 'User'
                    })
                    existingReaction.count = existingReaction.users.length
                  }
                } else {
                  // New reaction
                  reactions.push({
                    emoji: message.data.emoji,
                    users: [{
                      id: message.userId,
                      name: message.metadata?.displayName || 'User'
                    }],
                    count: 1
                  })
                }
                
                return { ...msg, reactions: [...reactions] }
              }
              return msg
            }))
          }
        })

        // Listen for presence changes
        channel.onPresence((users: any[]) => {
          const onlineUsersList: OnlineUser[] = users.map(u => ({
            id: u.userId,
            name: u.metadata?.displayName || u.metadata?.email || 'Anonymous',
            email: u.metadata?.email || '',
            status: u.metadata?.status || 'online',
            lastSeen: u.lastSeen
          }))
          setOnlineUsers(onlineUsersList)
        })

        // Load existing messages (mock for now)
        if (conversationId === '1') {
          const mockMessages: Message[] = [
            {
              id: '1',
              type: 'user',
              content: 'Can you help us brainstorm ideas for our new product launch?',
              timestamp: '10:30 AM',
              userId: user.id,
              userName: user.displayName || user.email,
              userEmail: user.email,
              reactions: [
                { emoji: '👍', users: [{ id: 'user2', name: 'Sarah' }], count: 1 }
              ]
            },
            {
              id: '2',
              type: 'ai',
              content: 'I\'d be happy to help you brainstorm product launch ideas! Let me suggest a few strategic approaches:\n\n**1. Multi-channel Launch Strategy**\n- Social media teasers and countdown campaigns\n- Influencer partnerships and early access programs\n- Email marketing to existing customers\n- PR outreach to relevant industry publications\n\n**2. Community-Driven Launch**\n- Beta testing program with feedback collection\n- User-generated content campaigns\n- Community challenges and contests\n- Ambassador program for power users\n\n**3. Educational Content Marketing**\n- Behind-the-scenes development stories\n- Problem-solution focused content\n- Tutorial videos and demos\n- Webinars and live Q&A sessions\n\nWhat type of product are you launching? This will help me provide more targeted suggestions.',
              timestamp: '10:31 AM',
              reactions: [
                { emoji: '🔥', users: [{ id: 'user2', name: 'Sarah' }, { id: 'user3', name: 'Mike' }], count: 2 },
                { emoji: '💡', users: [{ id: 'user2', name: 'Sarah' }], count: 1 }
              ]
            },
            {
              id: '3',
              type: 'user',
              content: 'It\'s a productivity app for remote teams. We want to focus on the collaboration features.',
              timestamp: '10:35 AM',
              userId: 'user2',
              userName: 'Sarah Chen',
              userEmail: 'sarah@company.com',
              parentMessageId: '2'
            }
          ]
          setMessages(mockMessages)
        }

      } catch (error) {
        console.error('Failed to setup realtime:', error)
      }
    }

    setupRealtime()

    return () => {
      channel?.unsubscribe()
    }
  }, [conversationId, user])

  // Clean up typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 3000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    
    if (conversationId && value.trim()) {
      // Send typing indicator
      blink.realtime.publish(`conversation-${conversationId}`, 'typing_start', {
        timestamp: Date.now()
      }, {
        userId: user.id,
        metadata: { displayName: user.displayName || user.email }
      })

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        blink.realtime.publish(`conversation-${conversationId}`, 'typing_stop', {
          timestamp: Date.now()
        }, {
          userId: user.id,
          metadata: { displayName: user.displayName || user.email }
        })
      }, 2000)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageId = `msg_${Date.now()}`
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage: Message = {
      id: messageId,
      type: 'user',
      content: inputValue,
      timestamp,
      userId: user.id,
      userName: user.displayName || user.email,
      userEmail: user.email,
      parentMessageId: replyingTo
    }

    // Add message locally first (optimistic update)
    setMessages(prev => [...prev, userMessage])
    
    // Broadcast to other users
    if (conversationId) {
      await blink.realtime.publish(`conversation-${conversationId}`, 'new_message', {
        id: messageId,
        messageType: 'user',
        content: inputValue,
        timestamp: new Date().toISOString(),
        parentMessageId: replyingTo
      }, {
        userId: user.id,
        metadata: { 
          displayName: user.displayName || user.email,
          email: user.email
        }
      })
    }

    setInputValue('')
    setReplyingTo(null)
    setIsLoading(true)
    setStreamingMessage('')

    // Stop typing indicator
    if (conversationId) {
      blink.realtime.publish(`conversation-${conversationId}`, 'typing_stop', {
        timestamp: Date.now()
      }, {
        userId: user.id,
        metadata: { displayName: user.displayName || user.email }
      })
    }

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
      const aiMessageId = `ai_${Date.now()}`
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: streamingMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Broadcast AI response to other users
      if (conversationId) {
        await blink.realtime.publish(`conversation-${conversationId}`, 'new_message', {
          id: aiMessageId,
          messageType: 'ai',
          content: streamingMessage,
          timestamp: new Date().toISOString()
        }, {
          userId: 'ai',
          metadata: { displayName: 'AI Assistant' }
        })
      }
      
      setStreamingMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
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

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!conversationId) return

    await blink.realtime.publish(`conversation-${conversationId}`, 'message_reaction', {
      messageId,
      emoji,
      timestamp: Date.now()
    }, {
      userId: user.id,
      metadata: { displayName: user.displayName || user.email }
    })
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    // Focus input (you might want to add a ref to the textarea)
  }

  if (!conversationId && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header with online users */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">New Conversation</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {workspace}
              </Badge>
              {onlineUsers.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{onlineUsers.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {onlineUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              user.status === 'online' ? 'bg-green-500' : 
                              user.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
                Start a collaborative conversation
              </h2>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Ask questions, brainstorm ideas, or get help with your projects. Your team can join, react to messages, and collaborate in real-time.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2 text-sm">💡 Team Brainstorming</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Help us brainstorm marketing ideas for our new product launch"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2 text-sm">🔍 Collaborative Problem Solving</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "We're facing challenges with user retention. What strategies should we consider?"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2 text-sm">📊 Data Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Analyze these user feedback trends and suggest improvements"
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <h3 className="font-medium mb-2 text-sm">⚡ Quick Team Help</h3>
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
                onChange={(e) => handleInputChange(e.target.value)}
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

  const replyingToMessage = replyingTo ? messages.find(m => m.id === replyingTo) : null

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header with collaboration info */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {conversationId ? 'Product Strategy Discussion' : 'New Conversation'}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-muted-foreground">
                {onlineUsers.length} participant{onlineUsers.length !== 1 ? 's' : ''} online
              </p>
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {typingUsers.map(u => u.name).join(', ')} typing...
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {workspace}
            </span>
            {/* Online users avatars */}
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((onlineUser) => (
                <TooltipProvider key={onlineUser.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="w-6 h-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {onlineUser.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          onlineUser.status === 'online' ? 'bg-green-500' : 
                          onlineUser.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span>{onlineUser.name}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{onlineUsers.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
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
                    {message.parentMessageId && (
                      <Badge variant="outline" className="text-xs">
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Badge>
                    )}
                  </div>
                  
                  {message.parentMessageId && (
                    <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-accent">
                      <p className="text-xs text-muted-foreground">
                        Replying to: {messages.find(m => m.id === message.parentMessageId)?.content.slice(0, 100)}...
                      </p>
                    </div>
                  )}
                  
                  <div className={`text-[15px] leading-relaxed ${
                    message.type === 'system' ? 'text-muted-foreground italic' : 'text-foreground'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.map((reaction) => (
                        <TooltipProvider key={reaction.emoji}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs hover:bg-accent/20"
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                              >
                                {reaction.emoji} {reaction.count}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                {reaction.users.map(u => u.name).join(', ')}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                  
                  {/* Message actions */}
                  <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="h-7 px-2 text-xs hover:bg-muted"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs hover:bg-muted"
                      onClick={() => handleReply(message.id)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs hover:bg-muted"
                      onClick={() => handleReaction(message.id, '👍')}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs hover:bg-muted"
                      onClick={() => handleReaction(message.id, '❤️')}
                    >
                      <Heart className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs hover:bg-muted"
                      onClick={() => handleReaction(message.id, '😄')}
                    >
                      <Smile className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-muted">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
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
          {replyingToMessage && (
            <div className="mb-3 p-3 bg-muted/50 rounded-lg border-l-2 border-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Replying to {replyingToMessage.userName || 'User'}
                  </p>
                  <p className="text-sm text-foreground">
                    {replyingToMessage.content.slice(0, 100)}...
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={replyingTo ? "Reply to message..." : "Type your message..."}
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
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
            {onlineUsers.length > 1 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{onlineUsers.length - 1} other{onlineUsers.length > 2 ? 's' : ''} online</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}