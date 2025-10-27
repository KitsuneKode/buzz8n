import type { Execution, ExecutionLog } from '@buzz8n/common/types'
import { API_URL } from '@/utils/config'
import axios from 'axios'

let reconnectAttempts = 0
const maxReconnectAttempts = 5

// Helper function to fetch full execution details
const fetchFullExecutionDetails = async (executionId: string): Promise<Execution | null> => {
  try {
    const response = await axios.get<Execution>(`${API_URL}/execution/${executionId}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch execution details:', error)
    return null
  }
}
import { toast } from '@buzz8n/ui/components/sonner'
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
            const { setCurrentExecution, currentExecution } = useWorkflowEditorStore.getState()

            if (currentExecution) {
              const newExecution: Execution = {
                ...currentExecution,
                status: message.status,
                summary: message.executionSummary,
                finishedAt: message.finishedAt,
                durationMs: message.durationMs,
                logs: message.logs || currentExecution.logs, // Include logs if available
              }
              console.log('🔄 Setting current execution:', newExecution)
              setCurrentExecution(newExecution)

              // Fetch full execution details from the database
              fetchFullExecutionDetails(currentExecution.id)
                .then((fullExecution) => {
                  if (fullExecution) {
                    console.log('📊 Fetched full execution details:', fullExecution)
                    setCurrentExecution(fullExecution)
                  }
                })
                .catch((error) => {
                  console.error('❌ Failed to fetch full execution details:', error)
                })
            }
          })

          unsubscribe()

          const toastT = message.status === 'success' ? toast.success : toast.error
          toastT(message.executionSummary || 'Execution completed')
          return
        }

        console.log('❓ Unknown message type:', message)
      } catch (error) {
        console.error('❌ Error parsing message:', error)
      }
    }

    websocket.onclose = () => {
      const { connect } = get()
      set({ isConnected: false, isConnecting: false })
      console.log('❌ WebSocket disconnected')
      // Auto-reconnect with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
        setTimeout(() => {
          reconnectAttempts++
          connect()
        }, delay)
      }
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
