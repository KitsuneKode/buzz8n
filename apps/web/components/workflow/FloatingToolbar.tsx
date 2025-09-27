'use client'

import { Button } from '@buzz8n/ui/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@buzz8n/ui/components/tooltip'
import { 
  Plus, 
  Copy, 
  Layers3, 
  Sparkles,
  Zap,
  Database,
  Workflow,
  Users
} from 'lucide-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'

const toolbarButtons = [
  {
    id: 'add-node',
    icon: Plus,
    label: 'Add node',
    description: 'Add a new node to your workflow',
    action: 'toggleNodePalette'
  },
  {
    id: 'duplicate',
    icon: Copy,
    label: 'Duplicate',
    description: 'Duplicate selected nodes',
    action: 'duplicateSelected'
  },
  {
    id: 'layers',
    icon: Layers3,
    label: 'Layers',
    description: 'Manage workflow layers',
    action: 'openLayers'
  },
  {
    id: 'ai-assistant',
    icon: Sparkles,
    label: 'AI Assistant',
    description: 'Get AI suggestions for your workflow',
    action: 'openAI',
    highlight: true
  }
]

export function FloatingToolbar() {
  const { 
    toggleNodePalette,
    selectedNodes,
    isNodePaletteOpen 
  } = useWorkflowEditorStore()

  const handleAction = (action: string) => {
    switch (action) {
      case 'toggleNodePalette':
        toggleNodePalette()
        break
      case 'duplicateSelected':
        console.log('Duplicate selected nodes:', selectedNodes)
        break
      case 'openLayers':
        console.log('Open layers panel')
        break
      case 'openAI':
        console.log('Open AI assistant')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-2">
        {toolbarButtons.map((button) => (
          <Tooltip key={button.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`
                  w-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg
                  hover:bg-accent hover:scale-105 transition-all duration-200
                  ${button.highlight ? 'border-primary/50 bg-primary/5' : ''}
                  ${button.action === 'toggleNodePalette' && isNodePaletteOpen ? 'bg-primary text-primary-foreground' : ''}
                `}
                onClick={() => handleAction(button.action)}
              >
                <button.icon className={`w-5 h-5 ${button.highlight ? 'text-primary' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="text-center">
                <div className="font-medium">{button.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {button.description}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {/* Quick Categories */}
        <div className="w-px h-4 bg-border mx-auto my-2" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200"
              onClick={() => console.log('Quick add trigger')}
            >
              <Zap className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-center">
              <div className="font-medium">Triggers</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add workflow triggers
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200"
              onClick={() => console.log('Quick add action')}
            >
              <Database className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-center">
              <div className="font-medium">Actions</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add workflow actions
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200"
              onClick={() => console.log('Quick add flow')}
            >
              <Workflow className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-center">
              <div className="font-medium">Flow Control</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add conditional logic
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200"
              onClick={() => console.log('Quick add integration')}
            >
              <Users className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-center">
              <div className="font-medium">Integrations</div>
              <div className="text-xs text-muted-foreground mt-1">
                Connect external services
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
