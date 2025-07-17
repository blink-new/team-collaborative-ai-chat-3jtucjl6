import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  Edit,
  Save,
  Share,
  Download,
  Copy,
  MoreHorizontal,
  Users,
  Clock,
  Tag,
  FileText,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  StarOff
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
  content?: string
  metadata?: {
    createdBy: string
    createdAt: string
    updatedAt: string
    permissions: 'public' | 'private' | 'shared'
    collaborators?: string[]
    tags?: string[]
  }
}

interface DocumentViewerProps {
  user: User
  node: FileSystemNode | null
  onSave: (nodeId: string, content: string) => void
  onClose: () => void
}

export function DocumentViewer({ user, node, onSave, onClose }: DocumentViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isWatching, setIsWatching] = useState(true)

  useEffect(() => {
    if (node) {
      setContent(node.content || '')
      setTitle(node.name)
      setIsEditing(false)
    }
  }, [node])

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No file selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a document or conversation from the file tree to view it here
          </p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    onSave(node.id, content)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setContent(node.content || '')
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileExtension = (filename: string) => {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  const getFileIcon = () => {
    if (node.type === 'conversation') {
      return <MessageSquare className="w-5 h-5 text-purple-500" />
    }
    
    const ext = getFileExtension(node.name)
    switch (ext) {
      case 'md':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />
      case 'xlsx':
      case 'xls':
        return <FileText className="w-5 h-5 text-green-500" />
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const canEdit = node.metadata?.permissions !== 'private' || node.metadata?.createdBy === user.id

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  Created by {node.metadata?.createdBy === user.id ? 'You' : node.metadata?.createdBy}
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {node.metadata?.updatedAt ? formatDate(node.metadata.updatedAt) : 'Unknown'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Favorite Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    {isFavorite ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Watch Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWatching(!isWatching)}
                  >
                    {isWatching ? (
                      <Eye className="w-4 h-4 text-blue-500" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isWatching ? 'Stop watching' : 'Watch for changes'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Edit Button */}
            {canEdit && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}

            {/* More Actions */}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Permission Badge */}
            <Badge variant={
              node.metadata?.permissions === 'public' ? 'default' :
              node.metadata?.permissions === 'private' ? 'destructive' : 'secondary'
            }>
              {node.metadata?.permissions || 'shared'}
            </Badge>

            {/* Collaborators */}
            {node.metadata?.collaborators && node.metadata.collaborators.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex -space-x-1">
                  {node.metadata.collaborators.slice(0, 3).map((collaboratorId, index) => (
                    <Avatar key={collaboratorId} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback className="text-xs bg-muted">
                        {collaboratorId === user.id ? 'You'[0] : collaboratorId[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {node.metadata.collaborators.length > 3 && (
                    <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{node.metadata.collaborators.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {node.metadata?.tags && node.metadata.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div className="flex space-x-1">
                  {node.metadata.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {node.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{node.metadata.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 min-h-[400px] font-mono text-sm"
                placeholder="Start typing your content..."
              />
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {node.type === 'conversation' ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Conversation Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a collaborative AI conversation with {node.metadata?.collaborators?.length || 0} participants.
                  </p>
                </div>
                <Separator />
                <div className="whitespace-pre-wrap text-sm">
                  {content || 'No conversation content yet. Start a new discussion!'}
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {content || (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>This document is empty</p>
                    <p className="text-xs">Click Edit to add content</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEditing && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>{content.length} characters</span>
              <span>•</span>
              <span>{content.split('\n').length} lines</span>
              {node.type === 'document' && (
                <>
                  <span>•</span>
                  <span>{getFileExtension(node.name).toUpperCase()} format</span>
                </>
              )}
            </div>
            <div>
              Last saved {node.metadata?.updatedAt ? formatDate(node.metadata.updatedAt) : 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}