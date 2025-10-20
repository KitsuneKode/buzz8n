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
      model: 'gpt-4',
    },
    requiredCredentials: ['gemini_api_key'],
  },
  sumTool: {
    id: 'agent-tool-sum',
    type: 'sumTool',
    label: 'Sum Tool',
    description: 'Do sum of two numbers',
    icon: 'sum',
    category: 'ai-agent-tools',
    defaultConfig: {},
  },
  multiplyTool: {
    id: 'agent-tool-multi',
    type: 'multiplyTool',
    label: 'Multiplication Tool',
    description: 'Do multiplication of two numbers',
    icon: 'cross',
    category: 'ai-agent-tools',
    defaultConfig: {},
  },
}

// Helper function to get defaultConfig for a node type
export function getDefaultConfig(nodeType: string): Record<string, unknown> {
  return NODE_TEMPLATES[nodeType]?.defaultConfig || {}
}

// Helper function to get the full template for a node type
export function getNodeTemplate(nodeType: string): NodeTemplate | undefined {
  return NODE_TEMPLATES[nodeType]
}

// Helper function to get all node templates
export function getAllNodeTemplates(): NodeTemplate[] {
  return Object.values(NODE_TEMPLATES)
}
