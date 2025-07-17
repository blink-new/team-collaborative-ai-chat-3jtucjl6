import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Search,
  MoreHorizontal
} from 'lucide-react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface SidebarProps {
  user: User
  selectedWorkspace: string
  onWorkspaceChange: (workspace: string) => void
  selectedConversation: string | null
  onConversationChange: (conversationId: string | null) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  participants: number
  isActive: boolean
}

export function Sidebar({ 
  user, 
  selectedWorkspace, 
  onWorkspaceChange, 
  selectedConversation, 
  onConversationChange,
  collapsed,
  onToggleCollapse
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Mock conversations for now
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        title: 'Product Strategy Discussion',
        lastMessage: 'AI: Based on the market analysis...',
        timestamp: '2 min ago',
        participants: 3,
        isActive: true
      },
      {
        id: '2',
        title: 'Code Review Help',
        lastMessage: 'Can you help review this React component?',
        timestamp: '1 hour ago',
        participants: 2,
        isActive: false
      },
      {
        id: '3',
        title: 'Marketing Campaign Ideas',
        lastMessage: 'AI: Here are some creative campaign concepts...',
        timestamp: '3 hours ago',
        participants: 4,
        isActive: false
      }
    ]
    setConversations(mockConversations)
  }, [selectedWorkspace])

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSignOut = () => {
    blink.auth.logout()
  }

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Team Chat</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Workspace Selector */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Workspace</span>
              <Button variant="ghost" size="sm" className="p-1">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {/* TODO: Workspace selector */}}
            >
              <Users className="w-4 h-4 mr-2" />
              Default Team
            </Button>
          </div>

          <Separator />

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* New Conversation */}
          <div className="px-4 pb-4">
            <Button
              onClick={() => onConversationChange(null)}
              className="w-full justify-start"
              variant={selectedConversation === null ? "default" : "outline"}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onConversationChange(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm text-foreground truncate flex-1">
                      {conversation.title}
                    </h3>
                    <Button variant="ghost" size="sm" className="p-1 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.participants}
                      </Badge>
                      {conversation.isActive && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.displayName?.[0] || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName || user.email}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground"
              >
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}