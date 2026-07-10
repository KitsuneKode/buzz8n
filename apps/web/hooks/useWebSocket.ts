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
  } catch {
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

// Track whether we want to be connected (prevents unwanted auto-reconnects)
let shouldBeConnected = false
let reconnectTimer: NodeJS.Timeout | null = null

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  // State
  isConnected: false,
  isConnecting: false,
  error: null,
  ws: null,

  // Actions
  setState: (newState) => set(newState),

  connect: () => {
    const { ws, isConnecting } = get()

    // Prevent multiple connections
    if (ws?.readyState === WebSocket.OPEN || isConnecting) {
      return
    }

    // Mark that we want to be connected
    shouldBeConnected = true

    set({ isConnecting: true, error: null })

    const websocket = new WebSocket(WS_URL!)
    set({ ws: websocket })

    websocket.onopen = () => {
      reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      set({ isConnected: true, isConnecting: false, error: null })
    }

    websocket.onmessage = (event) => {
      try {
        // Handle ping messages from server
        if (event.data === 'ping') {
          websocket.send('pong')
          return
        }

        const message = JSON.parse(event.data)

        // Handle ExecutionLog messages
        if ('nodeId' in message && 'status' in message && message.type === 'node_event') {
          const log = message as ExecutionLog

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
          const { unsubscribe } = get()
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
              setCurrentExecution(newExecution)

              // Fetch full execution details from the database
              fetchFullExecutionDetails(currentExecution.id).then((fullExecution) => {
                if (fullExecution) {
                  setCurrentExecution(fullExecution)
                }
              })
            }
          })

          unsubscribe()

          const toastT = message.status === 'success' ? toast.success : toast.error
          toastT(message.executionSummary || 'Execution completed')
          return
        }
      } catch {
        // Ignore malformed messages
      }
    }

    websocket.onclose = (event) => {
      const { connect } = get()
      set({ isConnected: false, isConnecting: false })

      // Only auto-reconnect if:
      // 1. We WANT to be connected (not an intentional disconnect)
      // 2. Close was abnormal (code !== 1000)
      // 3. Haven't exceeded retry limit
      if (shouldBeConnected && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)

        reconnectTimer = setTimeout(() => {
          reconnectAttempts++
          connect()
        }, delay)
      } else {
        // Reset on normal close or max retries
        reconnectAttempts = 0
      }
    }

    websocket.onerror = () => {
      set({ error: 'Connection failed', isConnecting: false })
    }
  },

  disconnect: () => {
    // Mark that we DON'T want to be connected (prevents auto-reconnect)
    shouldBeConnected = false

    // Cancel any pending reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    // Reset reconnect attempts
    reconnectAttempts = 0

    const { ws, unsubscribe } = get()
    if (ws) {
      // Unsubscribe before closing
      unsubscribe()

      // Close with normal closure code (1000 = normal closure)
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Client disconnect')
      }

      set({ ws: null, isConnected: false, isConnecting: false })
    }
  },

  subscribe: (workflowId: string, executionId: string) => {
    const { ws } = get()
    if (ws?.readyState === WebSocket.OPEN) {
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
