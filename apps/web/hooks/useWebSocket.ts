import type { ExecutionLog } from '@buzz8n/common/types'
import { toast } from '@buzz8n/ui/components/sonner'
import { unsubscribe } from 'diagnostics_channel'
import { WS_URL } from '@/utils/config'
import { create } from 'zustand'

interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  ws: WebSocket | null
}

interface WebSocketActions {
  connect: () => void
  disconnect: () => void
  subscribe: (workflowId: string, executionId: string) => void
  unsubscribe: () => void
  setState: (state: Partial<WebSocketState>) => void
}

type WebSocketStore = WebSocketState & WebSocketActions

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  // State
  isConnected: false,
  isConnecting: false,
  error: null,
  ws: null,

  // Actions
  setState: (newState) => set(newState),

  connect: () => {
    const { ws, isConnecting, unsubscribe } = get()

    // Prevent multiple connections
    if (
      ws?.readyState === WebSocket.OPEN ||
      ws?.readyState === WebSocket.CONNECTING ||
      isConnecting
    ) {
      console.log('WebSocket already connected or connecting')
      return
    }

    console.log('🔄 Connecting WebSocket...')
    set({ isConnecting: true, error: null })

    const websocket = new WebSocket(WS_URL!)
    set({ ws: websocket })

    websocket.onopen = () => {
      set({ isConnected: true, isConnecting: false, error: null })
      console.log('✅ WebSocket connected')
    }

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('📨 WebSocket message:', message)

        // Handle ExecutionLog messages
        if ('nodeId' in message && 'status' in message && message.type === 'node_event') {
          const log = message as ExecutionLog
          console.log('📝 Processing ExecutionLog:', log)

          // Import store dynamically to avoid circular dependency
          import('@/stores/workflow-editor').then(({ useWorkflowEditorStore }) => {
            const { addExecutionLog, updateNodeStatus } = useWorkflowEditorStore.getState()

            // Add to execution logs
            addExecutionLog(log)

            // Update node status
            const statusMap: Record<string, string> = {
              loading: 'loading',
              success: 'success',
              error: 'error',
            }
            const mappedStatus = statusMap[log.status] || 'initial'
            updateNodeStatus(log.nodeId, mappedStatus)
          })
          return
        }

        // Handle execution completion
        if (message.type === 'execution_complete' && 'executionSummary' in message) {
          console.log('✅ Execution completed:', message)

          import('@/stores/workflow-editor').then(({ useWorkflowEditorStore }) => {
            const { setCurrentExecution } = useWorkflowEditorStore.getState()
            setCurrentExecution(null)
          })

          unsubscribe()
          toast.success(message.executionSummary || 'Execution completed')
          return
        }

        console.log('❓ Unknown message type:', message)
      } catch (error) {
        console.error('❌ Error parsing message:', error)
      }
    }

    websocket.onclose = () => {
      set({ isConnected: false, isConnecting: false })
      console.log('❌ WebSocket disconnected')
    }

    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      set({ error: 'Connection failed', isConnecting: false })
    }
  },

  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, isConnected: false, isConnecting: false })
    }
  },

  subscribe: (workflowId: string, executionId: string) => {
    const { ws } = get()
    if (ws?.readyState === WebSocket.OPEN) {
      console.log('📡 Subscribing to execution:', executionId)
      console.log('📡 Subscribing to workflow:', workflowId)
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          workflowId,
          executionId,
        }),
      )
    }
  },

  unsubscribe: () => {
    const { ws } = get()
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe' }))
    }
  },
}))

// Hook for easy access
export function useWebSocket() {
  const store = useWebSocketStore()
  return {
    isConnected: store.isConnected,
    isConnecting: store.isConnecting,
    error: store.error,
    subscribe: store.subscribe,
    unsubscribe: store.unsubscribe,
  }
}
