'use client'

import { Tabs, TabsList, TabsTrigger } from '@buzz8n/ui/components/tabs'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { useUpdateWorkflow } from '@/hooks/useWorkflow'
import { Switch } from '@buzz8n/ui/components/switch'
import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Badge } from '@buzz8n/ui/components/badge'
import { Share, Save, Circle } from 'lucide-react'
//TODO:Fix the functionality of the top bar
export function TopBar() {
  const { workflow, edges, nodes, activeTab, isDirty, setActiveTab } = useWorkflowEditorStore()
  const { mutate: saveWorkflowMutate, isPending: isSaving } = useUpdateWorkflow()

  const handleToggleActive = () => {
    // Toggle workflow active state
    console.log('Toggle active state')
  }

  const handleShare = () => {
    console.log('Share workflow')
  }

  const handleSave = async () => {
    if (!workflow) return

    const webhookNode = nodes.find((node) => node.data.type === 'webhook')

    console.log(webhookNode)

    saveWorkflowMutate({
      id: workflow.id,
      data: {
        nodes,
        edges,
        active: workflow.active,
      },
    })
  }

  if (!workflow) return null

  return (
    <div className="border-b border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Workflow info and tabs */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-semibold">{workflow.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Personal</span>
                <Circle className="w-1 h-1 fill-current" />
                <span>+ Add tag</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-4">
          {/* Active/Inactive toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="active-toggle" className="text-sm">
              {workflow.active ? 'Active' : 'Inactive'}
            </Label>
            <Switch
              id="active-toggle"
              checked={workflow.active}
              onCheckedChange={handleToggleActive}
            />
          </div>

          {/* Share button */}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>

          {/* Save button */}
          <Button
            variant={isSaving ? 'outline' : isDirty ? 'default' : 'outline'}
            size="sm"
            onClick={handleSave}
            className="relative"
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <Spinner />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
                {isDirty && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full"
                  />
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
