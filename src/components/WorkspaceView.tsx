import { useState } from 'react'
import { FileSystemTree } from './FileSystemTree'
import { DocumentViewer } from './DocumentViewer'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable'
import { 
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
}

interface FileSystemNode {
  id: string
  name: string
  type: 'folder' | 'document' | 'conversation'
  parentId: string | null
  children?: FileSystemNode[]
  content?: string
  metadata?: {
    createdBy: string
    createdAt: string
    updatedAt: string
    permissions: 'public' | 'private' | 'shared'
    collaborators?: string[]
    tags?: string[]
  }
  isExpanded?: boolean
  isSelected?: boolean
}

interface WorkspaceViewProps {
  user: User
  workspaceId: string
  onBack: () => void
}

export function WorkspaceView({ user, workspaceId, onBack }: WorkspaceViewProps) {
  const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleNodeSelect = (node: FileSystemNode) => {
    if (node.type !== 'folder') {
      setSelectedNode(node)
    }
  }

  const handleSaveDocument = (nodeId: string, content: string) => {
    // TODO: Implement save functionality
    console.log('Saving document:', nodeId, content)
    
    // Update the selected node with new content
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        content,
        metadata: {
          ...selectedNode.metadata!,
          updatedAt: new Date().toISOString()
        }
      })
    }
  }

  const handleCloseDocument = () => {
    setSelectedNode(null)
  }

  if (isFullscreen && selectedNode) {
    return (
      <div className="h-screen bg-background">
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              {selectedNode.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseDocument}
          >
            Close
          </Button>
        </div>
        <DocumentViewer
          user={user}
          node={selectedNode}
          onSave={handleSaveDocument}
          onClose={handleCloseDocument}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
            >
              ← Back to Chat
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Workspace Files</h1>
              <p className="text-sm text-muted-foreground">
                Manage documents, conversations, and folders
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <PanelRight className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </Button>
            
            {selectedNode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Tree Panel */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <FileSystemTree
                  user={user}
                  workspaceId={workspaceId}
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNode?.id || null}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Document Viewer Panel */}
          <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 70}>
            <DocumentViewer
              user={user}
              node={selectedNode}
              onSave={handleSaveDocument}
              onClose={handleCloseDocument}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border px-4 py-2 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Workspace: Default Team</span>
            <span>•</span>
            <span>
              {selectedNode ? (
                `Viewing: ${selectedNode.name}`
              ) : (
                'No file selected'
              )}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {selectedNode?.metadata?.permissions && (
                `Permission: ${selectedNode.metadata.permissions}`
              )}
            </span>
            {selectedNode?.metadata?.collaborators && (
              <>
                <span>•</span>
                <span>
                  {selectedNode.metadata.collaborators.length} collaborator{selectedNode.metadata.collaborators.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}