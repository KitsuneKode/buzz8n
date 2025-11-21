// Node template definitions - single source of truth
// This will eventually be moved to S3 or external JSON file

import { NodeTemplate } from '@/lib/types/workflow'

export const NODE_TEMPLATES: Record<string, NodeTemplate> = {
  manualTrigger: {
    id: 'manual-trigger',
    type: 'manualTrigger',
    label: 'Trigger manually',
    description: 'Runs the flow by clicking a button in n8n. Good for getting started quickly.',
    icon: 'play',
    category: 'triggers',
    defaultConfig: {},
  },
  telegramSendMessage: {
    id: 'telegram-send-message',
    type: 'telegramSendMessage',
    label: 'Send a message',
    description: 'Send a message through Telegram',
    icon: 'telegram',
    category: 'app-action',
    defaultConfig: {
      chatId: '',
      message: '',
    },
    requiredCredentials: ['telegram'],
  },
  emailSend: {
    id: 'email-send',
    type: 'emailSend',
    label: 'Send email',
    description: 'Send an email message',
    icon: 'email',
    category: 'app-action',
    defaultConfig: {
      to: '',
      subject: '',
      body: '',
    },
    requiredCredentials: ['email'],
  },
  webhook: {
    id: 'webhook',
    type: 'webhook',
    label: 'Webhook',
    description: 'Start your workflow via a webhook.',
    icon: 'webhook',
    category: 'triggers',
    defaultConfig: {
      path: '',
      method: 'POST',
      secret: null,
    },
  },
  aiAgent: {
    id: 'ai-agent',
    type: 'aiAgent',
    label: 'AI Agent',
    description: 'AI-powered automation and intelligence',
    icon: 'ai-agent',
    category: 'ai',
    defaultConfig: {
      prompt: '',
      model: 'gemini-2.5-flash',
    },
    requiredCredentials: ['gemini', 'openai', 'anthropic'],
  },
  sumTool: {
    id: 'agent-tool-sum',
    type: 'sum',
    label: 'Sum Tool',
    description: 'Do sum of two numbers',
    icon: 'sum',
    category: 'ai-agent-tools',
    defaultConfig: {},
  },
  multiplyTool: {
    id: 'agent-tool-multi',
    type: 'multiply',
    label: 'Multiplication Tool',
    description: 'Do multiplication of two numbers',
    icon: 'cross',
    category: 'ai-agent-tools',
    defaultConfig: {},
  },
  exponentialTool: {
    id: 'agent-tool-exponential',
    type: 'exponent',
    label: 'Exponential Tool',
    description: 'Do exponential of a number to a given number',
    icon: 'chevron-up',
    category: 'ai-agent-tools',
    defaultConfig: {},
  },
}

/**
 * Retrieve the default configuration for a node template.
 *
 * @param nodeType - The node template type identifier to look up
 * @returns The `defaultConfig` object for the specified node type, or an empty object if the node type is not found
 */
export function getDefaultConfig(nodeType: string): Record<string, unknown> {
  return NODE_TEMPLATES[nodeType]?.defaultConfig || {}
}

/**
 * Retrieve the node template for a given node type.
 *
 * @param nodeType - The template key identifying the node type in NODE_TEMPLATES
 * @returns The `NodeTemplate` for `nodeType`, or `undefined` if no matching template exists
 */
export function getNodeTemplate(nodeType: string): NodeTemplate | undefined {
  return NODE_TEMPLATES[nodeType]
}

/**
 * Retrieve an array of all node template definitions.
 *
 * @returns An array of all NodeTemplate objects from NODE_TEMPLATES.
 */
export function getAllNodeTemplates(): NodeTemplate[] {
  return Object.values(NODE_TEMPLATES)
}

/**
 * Check if a node's configuration is complete and valid.
 * A node is considered incomplete if:
 * - It requires credentials but none are set
 * - It has required config fields (from defaultConfig) that are empty or not set
 *
 * @param nodeType - The node template type identifier
 * @param nodeData - The node's data including config and credentials
 * @returns true if the node configuration is incomplete, false otherwise
 */
export function isNodeConfigIncomplete(
  nodeType: string,
  nodeData: {
    config?: Record<string, unknown>
    credentials?: { id: string; name: string; provider: string } | null
    requiredCredentials?: string[]
  },
): boolean {
  const template = NODE_TEMPLATES[nodeType]
  if (!template) return false

  // Check if credentials are required but not set
  if (
    template.requiredCredentials &&
    template.requiredCredentials.length > 0 &&
    !nodeData.credentials?.id
  ) {
    return true
  }

  // Check if required config fields are empty
  const defaultConfig = template.defaultConfig || {}
  const currentConfig = nodeData.config || {}

  for (const [key, defaultValue] of Object.entries(defaultConfig)) {
    // Skip fields that have null/undefined as default (they're optional)
    if (defaultValue === null || defaultValue === undefined) continue

    const currentValue = currentConfig[key]

    // Check if the field is empty
    if (
      currentValue === undefined ||
      currentValue === null ||
      currentValue === '' ||
      (Array.isArray(currentValue) && currentValue.length === 0)
    ) {
      return true
    }
  }

  return false
}
