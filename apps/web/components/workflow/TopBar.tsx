'use client'

import { Tabs, TabsList, TabsTrigger } from '@buzz8n/ui/components/tabs'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { useUpdateWorkflow } from '@/hooks/useWorkflow'
import { Switch } from '@buzz8n/ui/components/switch'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { Label } from '@buzz8n/ui/components/label'
import { Badge } from '@buzz8n/ui/components/badge'
import { WorkflowData } from '@/lib/types/workflow'
import { Share, Save, Circle } from 'lucide-react'

export function TopBar({ id }: { id: string }) {
  const {
    workflow,
    edges,
    nodes,
    startSaving,
    activeTab,
    isSaving,
    isDirty,
    setActiveTab,
    saveWorkflow,
  } = useWorkflowEditorStore()
  const { mutateAsync: saveWorkflowAsync } = useUpdateWorkflow(id)

  const handleToggleActive = () => {
    // Toggle workflow active state
    console.log('Toggle active state')
  }

  const handleShare = () => {
    console.log('Share workflow')
  }

  const handleSave = async () => {
    if (!workflow) return

    try {
      startSaving()
      const { updatedAt } = await saveWorkflowAsync({
        nodes,
        edges,
        active: workflow.active,
      })

      const updatedWorkflow: WorkflowData = {
        ...workflow,
        nodes,
        edges,
        updatedAt: new Date(updatedAt),
      }
      saveWorkflow(updatedWorkflow)
    } catch {
      toast.error('Failed to save workflow')
    }
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
            disabled={isSaving}
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
