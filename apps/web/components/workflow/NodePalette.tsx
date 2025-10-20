'use client'

import {
  BarChart3,
  Clock,
  Database,
  FileText,
  GitBranch,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Sigma,
  Sparkles,
  Users,
  Webhook,
  Zap,
} from 'lucide-react'
import { IconBrandTelegram, IconRobotFace } from '@tabler/icons-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { NodeCategory } from '@buzz8n/common/types/workflow'
import { getAllNodeTemplates } from '@/utils/node-templates'
import { Separator } from '@buzz8n/ui/components/separator'
import { Button } from '@buzz8n/ui/components/button'
import { Input } from '@buzz8n/ui/components/input'
import { Badge } from '@buzz8n/ui/components/badge'
import { NodeTemplate } from '@/lib/types/workflow'
import { useState } from 'react'

/**
 * Build node categories from the centralized registry of node templates.
 *
 * Produces category objects that group templates by their category id, assigning a human-readable label for each category and giving each template instance a unique id.
 *
 * @returns An array of NodeCategory objects where each item has `id`, `label`, and `nodes` (the templates for that category with unique instance ids)
 */
function generateNodeCategories(): NodeCategory[] {
  const allTemplates = getAllNodeTemplates()

  // Group templates by category
  const categoryMap = new Map<string, NodeTemplate[]>()

  allTemplates.forEach((template) => {
    const categoryId = template.category || 'other'
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, [])
    }
    categoryMap.get(categoryId)!.push({
      ...template,
      id: `${template.id}-${Date.now()}`, // Generate unique ID for each instance
    })
  })

  // Convert to NodeCategory format
  return Array.from(categoryMap.entries()).map(([categoryId, nodes]) => ({
    id: categoryId,
    label: getCategoryLabel(categoryId),
    nodes,
  }))
}

/**
 * Convert a node category identifier into a human-readable label.
 *
 * Translates well-known category IDs (for example, `ai`, `triggers`, `ai-agent-tools`) to friendly labels; for unknown IDs returns the ID with its first letter capitalized.
 *
 * @param categoryId - The category identifier to convert
 * @returns The human-readable label for the given category ID
 */
function getCategoryLabel(categoryId: string): string {
  const labelMap: Record<string, string> = {
    ai: 'AI',
    'app-action': 'Action in an app',
    triggers: 'Triggers',
    'ai-agent-tools': 'Agentic-Tools',
    'data-transformation': 'Data transformation',
    flow: 'Flow',
    core: 'Core',
    'human-in-loop': 'Human in the loop',
    other: 'Other',
  }
  return labelMap[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
}

const nodeCategories: NodeCategory[] = generateNodeCategories()

const getNodeIcon = (iconType: string) => {
  switch (iconType) {
    case 'play':
      return <Play className="w-5 h-5" />
    case 'telegram':
      return <IconBrandTelegram size={20} />
    case 'ai-agent':
      return <IconRobotFace size={20} />
    case 'email':
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
    case 'cross':
      return <Plus className="w-5 h-5 rotate-45" />
    case 'sum':
      return <Sigma className="w-5 h-5" />
    default:
      return <MoreHorizontal className="w-5 h-5" />
  }
}

/**
 * Render the node palette UI for searching, previewing, dragging, and adding nodes into the workflow.
 *
 * The palette provides a searchable list of node categories and nodes, filters out nodes that would
 * duplicate single-instance types (e.g., webhook, manual trigger), and conditionally shows agent-tool
 * nodes when adding tools to an AI agent. Clicking or dragging a node will add it to the canvas or
 * attach it to a pending connection as appropriate.
 *
 * @returns A JSX element that renders the interactive node palette.
 */
export function NodePalette() {
  const [searchQuery, setSearchQuery] = useState('')
  const { addNode, pendingConnectFromNodeId, nodes, addNodeWithEdge, handleId } =
    useWorkflowEditorStore()

  const existingWebhook = nodes.some((n) => n.data.type === 'webhook')
  const existingManualTrigger = nodes.some((n) => n.data.type === 'manualTrigger')

  const aiAgentNodeId = handleId?.split('-')[0]
  const onAiAgentAddTools = nodes.find((n) => n.id === aiAgentNodeId && n.data.type === 'aiAgent')

  const existingAiAgentTools = new Set(
    nodes
      .filter((n) => n.data.category === 'ai-agent-tools' && n.parentId === aiAgentNodeId)
      .map((n) => n.type),
  )

  const filteredCategories = nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          (node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
          !(
            (existingWebhook && node.type === 'webhook') ||
            (existingManualTrigger && node.type === 'manualTrigger')
          ) &&
          !existingAiAgentTools.has(node.type),
      ),
    }))
    .filter((category) => {
      if (category.nodes.length === 0) return false

      const isAiAgentTools = category.id === 'ai-agent-tools'

      return onAiAgentAddTools ? isAiAgentTools : !isAiAgentTools
    })

  const OFFSET = { x: 240, y: 0 }

  const existingNodesOffset =
    nodes.length > 0
      ? {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        }
      : {
          x: 100,
          y: 100,
        }

  const handleNodeClick = (template: NodeTemplate) => {
    console.log(template)
    if (pendingConnectFromNodeId) {
      const anchor = nodes.find((n) => n.id === pendingConnectFromNodeId)

      if (anchor && anchor.data.type === 'aiAgent') {
        if (!handleId) {
          OFFSET.x += 200
          // OFFSET(Math.random() - 0.5) * 300 + 100
        } else {
          OFFSET.y += (Math.random() - 0.5) * 200 + 100
          OFFSET.x = (Math.random() - 0.5) * 200
        }
      }

      const pos = anchor
        ? { x: anchor.position.x + OFFSET.x, y: anchor.position.y + OFFSET.y }
        : { x: 100, y: 100 }

      addNodeWithEdge(pendingConnectFromNodeId, template, pos, handleId)
      OFFSET.x = 240
      OFFSET.y = 0
    } else {
      // Fallback add (e.g., when palette opened from toolbar)
      addNode(template, existingNodesOffset)
    }
  }
  console.log(nodes)
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
        {filteredCategories.length === 0 && !onAiAgentAddTools && (
          <p className="text-center text-muted-foreground">No nodes found</p>
        )}
        {filteredCategories.length === 0 && onAiAgentAddTools && (
          <>
            <h4 className="text-sm font-medium text-primary flex items-center px-3 pb-3 rounded-lg border-secondary">
              Agentic-Tools
            </h4>
            <p className="text-center text-muted-foreground">No more tools found</p>
          </>
        )}
        {filteredCategories.map((category) => (
          <div key={category.id}>
            <h4 className="text-sm font-medium text-primary flex items-center px-3 pb-3 rounded-lg border-secondary">
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
                      <div className="font-medium text-sm text-foreground">{node.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {node.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              <Separator className="w-full bg-secondary" orientation="horizontal" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}