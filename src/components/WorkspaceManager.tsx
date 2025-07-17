import { useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { 
  Settings,
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Trash2,
  Edit,
  Copy,
  Mail,
  Calendar,
  Activity
} from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
}

interface WorkspaceManagerProps {
  user: User
  workspaceId: string
  onClose: () => void
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: 'online' | 'away' | 'offline'
  joinedAt: string
  lastActive: string
}

interface WorkspaceSettings {
  name: string
  description: string
  isPublic: boolean
  allowGuestAccess: boolean
  defaultRole: 'member' | 'viewer'
}

export function WorkspaceManager({ user, workspaceId, onClose }: WorkspaceManagerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>({
    name: 'Default Team',
    description: 'Main workspace for team collaboration',
    isPublic: false,
    allowGuestAccess: false,
    defaultRole: 'member'
  })
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: user.id,
      name: user.displayName || user.email,
      email: user.email,
      role: 'admin',
      status: 'online',
      joinedAt: '2024-01-15',
      lastActive: 'now'
    },
    {
      id: 'user2',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'member',
      status: 'online',
      joinedAt: '2024-01-16',
      lastActive: '5 min ago'
    },
    {
      id: 'user3',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: 'member',
      status: 'away',
      joinedAt: '2024-01-18',
      lastActive: '1 hour ago'
    },
    {
      id: 'user4',
      name: 'Emily Davis',
      email: 'emily@company.com',
      role: 'viewer',
      status: 'offline',
      joinedAt: '2024-01-20',
      lastActive: '2 days ago'
    }
  ])

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member')
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return
    
    // Mock invite functionality
    console.log('Inviting user:', inviteEmail, 'as', inviteRole)
    setInviteEmail('')
    setInviteRole('member')
    setShowInviteDialog(false)
  }

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ))
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'member': return <Users className="w-4 h-4 text-blue-500" />
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
      default: return null
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to workspace settings and member management'
      case 'member': return 'Can create conversations and collaborate with team'
      case 'viewer': return 'Can view conversations but cannot create or edit'
      default: return ''
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Workspace Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {teamMembers.filter(m => m.status === 'online').length} online now
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      3 created this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">247</div>
                    <p className="text-xs text-muted-foreground">
                      +18% from last week
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest workspace activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          S
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sarah Chen created "Q4 Planning Session"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                          M
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mike Johnson joined the workspace</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI Assistant helped with 15 queries</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage who has access to this workspace
                  </p>
                </div>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
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
                      <div>
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={(value: 'member' | 'viewer') => setInviteRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRoleDescription(inviteRole)}
                        </p>
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

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-muted">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                              member.status === 'online' ? 'bg-green-500' : 
                              member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{member.name}</h4>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Joined {member.joinedAt}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Last active {member.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                          {member.id !== user.id && (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(value: 'admin' | 'member' | 'viewer') => handleRoleChange(member.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic workspace configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={workspaceSettings.name}
                      onChange={(e) => setWorkspaceSettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-description">Description</Label>
                    <Textarea
                      id="workspace-description"
                      value={workspaceSettings.description}
                      onChange={(e) => setWorkspaceSettings(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>Control who can access this workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Workspace</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anyone in your organization to join
                      </p>
                    </div>
                    <Button
                      variant={workspaceSettings.isPublic ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWorkspaceSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    >
                      {workspaceSettings.isPublic ? 'Public' : 'Private'}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Guest Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow external users to join conversations
                      </p>
                    </div>
                    <Button
                      variant={workspaceSettings.allowGuestAccess ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWorkspaceSettings(prev => ({ ...prev, allowGuestAccess: !prev.allowGuestAccess }))}
                    >
                      {workspaceSettings.allowGuestAccess ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Default Role for New Members</Label>
                    <Select
                      value={workspaceSettings.defaultRole}
                      onValueChange={(value: 'member' | 'viewer') => setWorkspaceSettings(prev => ({ ...prev, defaultRole: value }))}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Usage Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Messages sent</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">AI queries</span>
                        <span className="font-medium">389</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Files shared</span>
                        <span className="font-medium">56</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Reactions added</span>
                        <span className="font-medium">234</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Activity Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Today</span>
                        <span className="font-medium">47 messages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Yesterday</span>
                        <span className="font-medium">62 messages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">This week</span>
                        <span className="font-medium">312 messages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">This month</span>
                        <span className="font-medium">1,247 messages</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Most Active Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers
                      .sort((a, b) => Math.random() - 0.5) // Mock sorting
                      .slice(0, 3)
                      .map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{member.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 100) + 50} messages
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}