import { useState, useEffect } from 'react'
import { CollaborativeSidebar } from './CollaborativeSidebar'
import { CollaborativeChat } from './CollaborativeChat'
import { WorkspaceView } from './WorkspaceView'
import { blink } from '../blink/client'

interface User {
  id: string
  email: string
  displayName?: string
}

interface ChatInterfaceProps {
  user: User
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState('default')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showWorkspaceView, setShowWorkspaceView] = useState(false)

  if (showWorkspaceView) {
    return (
      <WorkspaceView
        user={user}
        workspaceId={selectedWorkspace}
        onBack={() => setShowWorkspaceView(false)}
      />
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <CollaborativeSidebar
        user={user}
        selectedWorkspace={selectedWorkspace}
        onWorkspaceChange={setSelectedWorkspace}
        selectedConversation={selectedConversation}
        onConversationChange={setSelectedConversation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onShowWorkspaceView={() => setShowWorkspaceView(true)}
      />
      
      <CollaborativeChat
        user={user}
        workspace={selectedWorkspace}
        conversationId={selectedConversation}
        onNewConversation={() => setSelectedConversation(null)}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  )
}