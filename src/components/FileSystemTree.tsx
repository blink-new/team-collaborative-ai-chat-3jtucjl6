import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  MessageSquare,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Move,
  Share,
  Lock,
  Users,
  Search,
  Filter
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

interface FileSystemTreeProps {
  user: User
  workspaceId: string
  onNodeSelect: (node: FileSystemNode) => void
  selectedNodeId: string | null
}

export function FileSystemTree({ user, workspaceId, onNodeSelect, selectedNodeId }: FileSystemTreeProps) {
  const [nodes, setNodes] = useState<FileSystemNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'document' | 'conversation'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeType, setNewNodeType] = useState<'folder' | 'document' | 'conversation'>('folder')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  // Initialize mock data
  useEffect(() => {
    const mockNodes: FileSystemNode[] = [
      {
        id: 'root_projects',
        name: 'Projects',
        type: 'folder',
        parentId: null,
        isExpanded: true,
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          permissions: 'shared',
          collaborators: [user.id, 'user2', 'user3']
        }
      },
      {
        id: 'root_docs',
        name: 'Documents',
        type: 'folder',
        parentId: null,
        isExpanded: true,
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          permissions: 'shared'
        }
      },
      {
        id: 'root_conversations',
        name: 'Conversations',
        type: 'folder',
        parentId: null,
        isExpanded: false,
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          permissions: 'shared'
        }
      },
      // Projects subfolder
      {
        id: 'proj_q4',
        name: 'Q4 Planning',
        type: 'folder',
        parentId: 'root_projects',
        isExpanded: false,
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T09:00:00Z',
          permissions: 'shared',
          tags: ['planning', 'q4']
        }
      },
      {
        id: 'proj_marketing',
        name: 'Marketing Campaign',
        type: 'folder',
        parentId: 'root_projects',
        isExpanded: true,
        metadata: {
          createdBy: 'user2',
          createdAt: '2024-01-17T14:00:00Z',
          updatedAt: '2024-01-17T14:00:00Z',
          permissions: 'shared',
          tags: ['marketing', 'campaign']
        }
      },
      // Documents
      {
        id: 'doc_strategy',
        name: 'Product Strategy.md',
        type: 'document',
        parentId: 'root_docs',
        content: '# Product Strategy\\n\\nOur vision for the next quarter...',
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-18T11:00:00Z',
          updatedAt: '2024-01-20T16:30:00Z',
          permissions: 'shared',
          collaborators: [user.id, 'user2'],
          tags: ['strategy', 'product']
        }
      },
      {
        id: 'doc_roadmap',
        name: 'Roadmap 2024.md',
        type: 'document',
        parentId: 'root_docs',
        content: '# 2024 Product Roadmap\\n\\n## Q1 Goals\\n- Feature A\\n- Feature B',
        metadata: {
          createdBy: 'user2',
          createdAt: '2024-01-19T13:00:00Z',
          updatedAt: '2024-01-19T13:00:00Z',
          permissions: 'public',
          tags: ['roadmap', '2024']
        }
      },
      // Marketing subfolder documents
      {
        id: 'doc_campaign_brief',
        name: 'Campaign Brief.md',
        type: 'document',
        parentId: 'proj_marketing',
        content: '# Marketing Campaign Brief\\n\\nTarget audience: ...',
        metadata: {
          createdBy: 'user2',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          permissions: 'shared',
          tags: ['marketing', 'brief']
        }
      },
      {
        id: 'doc_budget',
        name: 'Budget Analysis.xlsx',
        type: 'document',
        parentId: 'proj_marketing',
        metadata: {
          createdBy: 'user3',
          createdAt: '2024-01-21T15:00:00Z',
          updatedAt: '2024-01-21T15:00:00Z',
          permissions: 'private',
          tags: ['budget', 'analysis']
        }
      },
      // Conversations
      {
        id: 'conv_planning',
        name: 'Product Planning Discussion',
        type: 'conversation',
        parentId: 'root_conversations',
        metadata: {
          createdBy: user.id,
          createdAt: '2024-01-22T09:00:00Z',
          updatedAt: '2024-01-22T14:30:00Z',
          permissions: 'shared',
          collaborators: [user.id, 'user2', 'user3'],
          tags: ['planning', 'discussion']
        }
      },
      {
        id: 'conv_review',
        name: 'Code Review Session',
        type: 'conversation',
        parentId: 'root_conversations',
        metadata: {
          createdBy: 'user2',
          createdAt: '2024-01-23T11:00:00Z',
          updatedAt: '2024-01-23T12:00:00Z',
          permissions: 'shared',
          collaborators: [user.id, 'user2'],
          tags: ['code', 'review']
        }
      }
    ]

    setNodes(mockNodes)
  }, [user.id, workspaceId])

  // Build tree structure
  const buildTree = (nodes: FileSystemNode[]): FileSystemNode[] => {
    const nodeMap = new Map<string, FileSystemNode>()
    const rootNodes: FileSystemNode[] = []

    // Create map of all nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    // Build parent-child relationships
    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(nodeWithChildren)
        }
      } else {
        rootNodes.push(nodeWithChildren)
      }
    })

    return rootNodes
  }

  // Filter nodes based on search and type
  const filterNodes = (nodes: FileSystemNode[]): FileSystemNode[] => {
    if (!searchQuery && filterType === 'all') return nodes

    return nodes.filter(node => {
      const matchesSearch = !searchQuery || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = filterType === 'all' || node.type === filterType

      return matchesSearch && matchesType
    })
  }

  const toggleExpanded = (nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isExpanded: !node.isExpanded }
        : node
    ))
  }

  const handleNodeClick = (node: FileSystemNode) => {
    if (node.type === 'folder') {
      toggleExpanded(node.id)
    } else {
      onNodeSelect(node)
    }
  }

  const handleCreateNode = () => {
    if (!newNodeName.trim()) return

    const newNode: FileSystemNode = {
      id: `node_${Date.now()}`,
      name: newNodeName,
      type: newNodeType,
      parentId: selectedParentId,
      metadata: {
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: 'shared'
      }
    }

    setNodes(prev => [...prev, newNode])
    setNewNodeName('')
    setNewNodeType('folder')
    setSelectedParentId(null)
    setShowCreateDialog(false)
  }

  const getNodeIcon = (node: FileSystemNode) => {
    switch (node.type) {
      case 'folder':
        return node.isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-500" />
        ) : (
          <Folder className="w-4 h-4 text-blue-500" />
        )
      case 'document':
        return <File className="w-4 h-4 text-green-500" />
      case 'conversation':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const getPermissionIcon = (permissions: string) => {
    switch (permissions) {
      case 'public':
        return <Users className="w-3 h-3 text-green-500" />
      case 'private':
        return <Lock className="w-3 h-3 text-red-500" />
      case 'shared':
        return <Share className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const renderNode = (node: FileSystemNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center space-x-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary/10 border border-primary/20' 
              : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Expand/Collapse Icon */}
          {node.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 w-4 h-4"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(node.id)
              }}
            >
              {node.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          {node.type !== 'folder' && <div className="w-4" />}

          {/* Node Icon */}
          {getNodeIcon(node)}

          {/* Node Name */}
          <span className="flex-1 text-sm font-medium text-foreground truncate">
            {node.name}
          </span>

          {/* Permission Icon */}
          {node.metadata?.permissions && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {getPermissionIcon(node.metadata.permissions)}
                </TooltipTrigger>
                <TooltipContent>
                  {node.metadata.permissions === 'public' && 'Public - Everyone can view'}
                  {node.metadata.permissions === 'private' && 'Private - Only you can view'}
                  {node.metadata.permissions === 'shared' && 'Shared - Team members can view'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Actions Menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Show context menu
              }}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Render Children */}
        {node.type === 'folder' && node.isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const treeData = buildTree(filterNodes(nodes))

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Workspace Files</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-name">Name</Label>
                  <Input
                    id="node-name"
                    placeholder="Enter name..."
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="node-type">Type</Label>
                  <Select value={newNodeType} onValueChange={(value: 'folder' | 'document' | 'conversation') => setNewNodeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="folder">📁 Folder</SelectItem>
                      <SelectItem value="document">📄 Document</SelectItem>
                      <SelectItem value="conversation">💬 Conversation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parent-folder">Parent Folder (optional)</Label>
                  <Select value={selectedParentId || ''} onValueChange={(value) => setSelectedParentId(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent folder..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Root</SelectItem>
                      {nodes.filter(n => n.type === 'folder').map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNode}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value: 'all' | 'folder' | 'document' | 'conversation') => setFilterType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="folder">📁 Folders</SelectItem>
              <SelectItem value="document">📄 Documents</SelectItem>
              <SelectItem value="conversation">💬 Conversations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tree View */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {treeData.map(node => renderNode(node))}
        </div>
        {treeData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}