import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Crown,
  Circle,
  Hash,
  Lock,
  Globe,
  Star,
  Archive,
  FolderOpen
} from 'lucide-react'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface CollaborativeSidebarProps {
  user: User
  selectedWorkspace: string
  onWorkspaceChange: (workspace: string) => void
  selectedConversation: string | null
  onConversationChange: (conversationId: string | null) => void
  collapsed: boolean
  onToggleCollapse: () => void
  onShowWorkspaceView: () => void
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  participants: TeamMember[]
  isActive: boolean
  isPrivate: boolean
  isFavorite: boolean
  unreadCount: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: 'online' | 'away' | 'offline'
  avatar?: string
  lastSeen?: string
}

interface Workspace {
  id: string
  name: string
  description: string
  memberCount: number
  isDefault: boolean
}

export function CollaborativeSidebar({ 
  user, 
  selectedWorkspace, 
  onWorkspaceChange, 
  selectedConversation, 
  onConversationChange,
  collapsed,
  onToggleCollapse,
  onShowWorkspaceView
}: CollaborativeSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [newConversationTitle, setNewConversationTitle] = useState('')
  const [newConversationDescription, setNewConversationDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  // Mock data initialization
  useEffect(() => {
    const mockWorkspaces: Workspace[] = [
      {
        id: 'default',
        name: 'Default Team',
        description: 'Main workspace for team collaboration',
        memberCount: 5,
        isDefault: true
      },
      {
        id: 'marketing',
        name: 'Marketing Team',
        description: 'Marketing campaigns and strategies',
        memberCount: 3,
        isDefault: false
      },
      {
        id: 'development',
        name: 'Development',
        description: 'Technical discussions and code reviews',
        memberCount: 8,
        isDefault: false
      }
    ]
    setWorkspaces(mockWorkspaces)

    const mockTeamMembers: TeamMember[] = [
      {
        id: user.id,
        name: user.displayName || user.email,
        email: user.email,
        role: 'admin',
        status: 'online'
      },
      {
        id: 'user2',
        name: 'Sarah Chen',
        email: 'sarah@company.com',
        role: 'member',
        status: 'online'
      },
      {
        id: 'user3',
        name: 'Mike Johnson',
        email: 'mike@company.com',
        role: 'member',
        status: 'away',
        lastSeen: '5 min ago'
      },
      {
        id: 'user4',
        name: 'Emily Davis',
        email: 'emily@company.com',
        role: 'viewer',
        status: 'offline',
        lastSeen: '2 hours ago'
      },
      {
        id: 'user5',
        name: 'Alex Rodriguez',
        email: 'alex@company.com',
        role: 'member',
        status: 'online'
      }
    ]
    setTeamMembers(mockTeamMembers)

    const mockConversations: Conversation[] = [
      {
        id: '1',
        title: 'Product Strategy Discussion',
        lastMessage: 'AI: Based on the market analysis...',
        timestamp: '2 min ago',
        participants: mockTeamMembers.slice(0, 3),
        isActive: true,
        isPrivate: false,
        isFavorite: true,
        unreadCount: 0
      },
      {
        id: '2',
        title: 'Code Review Help',
        lastMessage: 'Can you help review this React component?',
        timestamp: '1 hour ago',
        participants: mockTeamMembers.slice(0, 2),
        isActive: false,
        isPrivate: true,
        isFavorite: false,
        unreadCount: 3
      },
      {
        id: '3',
        title: 'Marketing Campaign Ideas',
        lastMessage: 'AI: Here are some creative campaign concepts...',
        timestamp: '3 hours ago',
        participants: mockTeamMembers.slice(1, 5),
        isActive: false,
        isPrivate: false,
        isFavorite: false,
        unreadCount: 1
      },
      {
        id: '4',
        title: 'Q4 Planning Session',
        lastMessage: 'Let\'s discuss our goals for next quarter',
        timestamp: '1 day ago',
        participants: mockTeamMembers,
        isActive: false,
        isPrivate: false,
        isFavorite: true,
        unreadCount: 0
      }
    ]
    setConversations(mockConversations)
  }, [selectedWorkspace, user])

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSignOut = () => {
    blink.auth.logout()
  }

  const handleCreateConversation = () => {
    if (!newConversationTitle.trim()) return

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: newConversationTitle,
      lastMessage: 'Conversation started',
      timestamp: 'now',
      participants: [teamMembers.find(m => m.id === user.id)!],
      isActive: false,
      isPrivate: false,
      isFavorite: false,
      unreadCount: 0
    }

    setConversations(prev => [newConversation, ...prev])
    setNewConversationTitle('')
    setNewConversationDescription('')
    setShowNewConversationDialog(false)
    onConversationChange(newConversation.id)
  }

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return
    
    // Mock invite functionality
    console.log('Inviting user:', inviteEmail)
    setInviteEmail('')
    setShowInviteDialog(false)
  }

  const toggleFavorite = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isFavorite: !conv.isFavorite }
        : conv
    ))
  }

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace)
  const onlineMembers = teamMembers.filter(m => m.status === 'online')

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
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Workspace Settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteUser}>
                          Send Invite
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {/* TODO: Workspace selector */}}
            >
              <Users className="w-4 h-4 mr-2" />
              <div className="flex-1 text-left">
                <div className="font-medium">{currentWorkspace?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentWorkspace?.memberCount} members
                </div>
              </div>
            </Button>
            
            {/* Workspace Files Button */}
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={onShowWorkspaceView}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              <span>Workspace Files</span>
            </Button>
          </div>

          <Separator />

          {/* Team Members */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Team ({onlineMembers.length}/{teamMembers.length} online)
              </span>
            </div>
            <div className="space-y-2">
              {teamMembers.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-muted">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      member.status === 'online' ? 'bg-green-500' : 
                      member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {member.name}
                      </span>
                      {member.role === 'admin' && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.status === 'online' ? 'Online' : member.lastSeen}
                    </p>
                  </div>
                </div>
              ))}
              {teamMembers.length > 4 && (
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  +{teamMembers.length - 4} more members
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* New Conversation */}
          <div className="px-4 pb-4">
            <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
              <DialogTrigger asChild>
                <Button
                  className="w-full justify-start"
                  variant={selectedConversation === null ? "default" : "outline"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conversation-title">Title</Label>
                    <Input
                      id="conversation-title"
                      placeholder="e.g., Product Planning Discussion"
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversation-description">Description (optional)</Label>
                    <Textarea
                      id="conversation-description"
                      placeholder="Brief description of what this conversation is about..."
                      value={newConversationDescription}
                      onChange={(e) => setNewConversationDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateConversation}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1">
              {/* Favorites */}
              {filteredConversations.some(c => c.isFavorite) && (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Favorites
                    </span>
                  </div>
                  {filteredConversations.filter(c => c.isFavorite).map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedConversation === conversation.id}
                      onSelect={() => onConversationChange(conversation.id)}
                      onToggleFavorite={() => toggleFavorite(conversation.id)}
                    />
                  ))}
                  <Separator className="my-2" />
                </>
              )}

              {/* All Conversations */}
              <div className="flex items-center space-x-2 py-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Conversations
                </span>
              </div>
              {filteredConversations.filter(c => !c.isFavorite).map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation === conversation.id}
                  onSelect={() => onConversationChange(conversation.id)}
                  onToggleFavorite={() => toggleFavorite(conversation.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user.displayName?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
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

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

function ConversationItem({ conversation, isSelected, onSelect, onToggleFavorite }: ConversationItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {conversation.isPrivate ? (
            <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
          <h3 className="font-medium text-sm text-foreground truncate">
            {conversation.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite()
                  }}
                >
                  <Star className={`w-3 h-3 ${conversation.isFavorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {conversation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground truncate mb-2">
        {conversation.lastMessage}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {conversation.timestamp}
          </span>
          <div className="flex -space-x-1">
            {conversation.participants.slice(0, 3).map((participant) => (
              <Avatar key={participant.id} className="w-4 h-4 border border-background">
                <AvatarFallback className="text-xs bg-muted">
                  {participant.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {conversation.participants.length > 3 && (
              <div className="w-4 h-4 bg-muted border border-background rounded-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{conversation.participants.length - 3}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {conversation.isActive && (
            <div className="w-2 h-2 bg-accent rounded-full"></div>
          )}
          {conversation.unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}