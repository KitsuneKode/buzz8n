'use client'

import { useState } from 'react'
import { Input } from '@buzz8n/ui/components/input'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { Search, Play, Mail, Webhook, Clock, Zap, FileText, GitBranch, MessageSquare, BarChart3, MoreHorizontal, Sparkles, Database, Users, Plus } from 'lucide-react'
import { IconBrandTelegram } from '@tabler/icons-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { NodeTemplate, NodeType } from '@/lib/types/workflow'

const nodeCategories = [
  {
    id: 'ai',
    label: 'AI',
    nodes: [
      {
        id: 'ai-agent',
        type: 'other' as NodeType,
        label: 'Build autonomous agents, summarise or search documents, etc.',
        description: 'AI-powered automation and intelligence',
        icon: 'sparkles',
        category: 'ai',
        defaultConfig: {},
      },
    ]
  },
  {
    id: 'app-action',
    label: 'Action in an app',
    nodes: [
      {
        id: 'telegram-get-chat',
        type: 'telegramGetChat' as NodeType,
        label: 'Do something in an app or service like Google Sheets, Telegram or Notion',
        description: 'Connect and interact with external applications',
        icon: 'telegram',
        category: 'app-action',
        defaultConfig: { chatId: '' },
      },
    ]
  },
  {
    id: 'data-transformation',
    label: 'Data transformation',
    nodes: [
      {
        id: 'data-transform',
        type: 'other' as NodeType,
        label: 'Manipulate, filter or convert data',
        description: 'Transform and process your workflow data',
        icon: 'zap',
        category: 'data-transformation',
        defaultConfig: {},
      },
    ]
  },
  {
    id: 'flow',
    label: 'Flow',
    nodes: [
      {
        id: 'flow-control',
        type: 'other' as NodeType,
        label: 'Branch, merge or loop the flow, etc.',
        description: 'Control the execution flow of your workflow',
        icon: 'git-branch',
        category: 'flow',
        defaultConfig: {},
      },
    ]
  },
  {
    id: 'core',
    label: 'Core',
    nodes: [
      {
        id: 'core-nodes',
        type: 'other' as NodeType,
        label: 'Set values, make HTTP requests, set webhooks, etc.',
        description: 'Essential workflow building blocks',
        icon: 'database',
        category: 'core',
        defaultConfig: {},
      },
    ]
  },
  {
    id: 'human-in-loop',
    label: 'Human in the loop',
    nodes: [
      {
        id: 'human-approval',
        type: 'other' as NodeType,
        label: 'Wait for approval or human input before continuing',
        description: 'Include human decision points in automation',
        icon: 'users',
        category: 'human-in-loop',
        defaultConfig: {},
      },
    ]
  },
  {
    id: 'add-trigger',
    label: 'Add another trigger',
    nodes: [
      {
        id: 'additional-trigger',
        type: 'manualTrigger' as NodeType,
        label: 'Triggers start your workflow. Workflows can have multiple triggers.',
        description: 'Add more ways to start your workflow',
        icon: 'plus',
        category: 'add-trigger',
        defaultConfig: {},
      },
    ]
  },
]

const getNodeIcon = (iconType: string) => {
  switch (iconType) {
    case 'play':
      return <Play className="w-5 h-5" />
    case 'telegram':
      return <IconBrandTelegram size={20} />
    case 'mail':
      return <Mail className="w-5 h-5" />
    case 'webhook':
      return <Webhook className="w-5 h-5" />
    case 'clock':
      return <Clock className="w-5 h-5" />
    case 'zap':
      return <Zap className="w-5 h-5" />
    case 'file-text':
      return <FileText className="w-5 h-5" />
    case 'git-branch':
      return <GitBranch className="w-5 h-5" />
    case 'message-square':
      return <MessageSquare className="w-5 h-5" />
    case 'bar-chart-3':
      return <BarChart3 className="w-5 h-5" />
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />
    case 'database':
      return <Database className="w-5 h-5" />
    case 'users':
      return <Users className="w-5 h-5" />
    case 'plus':
      return <Plus className="w-5 h-5" />
    default:
      return <MoreHorizontal className="w-5 h-5" />
  }
}

export function NodePalette() {
  const [searchQuery, setSearchQuery] = useState('')
  const { addNode, toggleNodePalette } = useWorkflowEditorStore()

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)

  const handleNodeClick = (template: NodeTemplate) => {
    // Add node to center of viewport
    addNode(template, { x: 250, y: 200 })
    toggleNodePalette()
  }

  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          A trigger is a step that starts your workflow
        </p>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.id}>
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              {category.label}
              {category.id === 'triggers' && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Recommended
                </Badge>
              )}
            </h4>
            <div className="space-y-2">
              {category.nodes.map((node) => (
                <Button
                  key={node.id}
                  variant="ghost"
                  className="w-full h-auto p-3 justify-start text-left hover:bg-accent"
                  onClick={() => handleNodeClick(node)}
                  draggable
                  onDragStart={(e) => onDragStart(e, node)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                      {getNodeIcon(node.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {node.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {node.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
