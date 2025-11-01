// Field configuration interface

const AI_MODELS = [
  // OpenAI - Latest Models (2025)
  { value: 'gpt-5', type: 'openai', label: 'GPT-5' },
  { value: 'gpt-5-mini', type: 'openai', label: 'GPT-5 Mini' },
  { value: 'gpt-4o', type: 'openai', label: 'GPT-4o' },
  { value: 'gpt-4o-2024-11-20', type: 'openai', label: 'GPT-4o (Nov 2024)' },
  { value: 'gpt-4o-mini', type: 'openai', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', type: 'openai', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', type: 'openai', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', type: 'openai', label: 'GPT-3.5 Turbo' },

  // Google Gemini - Latest Models (2025)
  { value: 'gemini-2.0-flash-exp', type: 'gemini', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.0-pro-exp', type: 'gemini', label: 'Gemini 2.0 Pro' },
  { value: 'gemini-2.0-flash-thinking-exp', type: 'gemini', label: 'Gemini 2.0 Flash Thinking' },
  { value: 'gemini-1.5-pro', type: 'gemini', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', type: 'gemini', label: 'Gemini 1.5 Flash' },

  // Anthropic Claude - Latest Models (2024-2025)
  { value: 'claude-3-5-sonnet-20241022', type: 'anthropic', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus-20240229', type: 'anthropic', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', type: 'anthropic', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', type: 'anthropic', label: 'Claude 3 Haiku' },

  // xAI Grok - Latest Models (2025)
  { value: 'grok-4', type: 'xai', label: 'Grok 4' },
  { value: 'grok-3', type: 'xai', label: 'Grok 3' },
  { value: 'grok-3-mini', type: 'xai', label: 'Grok 3 Mini' },
  { value: 'grok-2', type: 'xai', label: 'Grok 2' },

  // DeepSeek - Latest Models (2025)
  { value: 'deepseek-v3.1', type: 'deepseek', label: 'DeepSeek V3.1' },
  { value: 'deepseek-r1', type: 'deepseek', label: 'DeepSeek R1' },
  { value: 'deepseek-v3', type: 'deepseek', label: 'DeepSeek V3' },

  // Meta Llama - Latest Models (2024)
  { value: 'llama-3.2-90b-vision', type: 'meta', label: 'Llama 3.2 90B Vision' },
  { value: 'llama-3.2-11b-vision', type: 'meta', label: 'Llama 3.2 11B Vision' },
  { value: 'llama-3.1-405b', type: 'meta', label: 'Llama 3.1 405B' },
  { value: 'llama-3.1-70b', type: 'meta', label: 'Llama 3.1 70B' },
  { value: 'llama-3.1-8b', type: 'meta', label: 'Llama 3.1 8B' },

  // Mistral AI - Latest Models (2025)
  { value: 'codestral-25.01', type: 'mistral', label: 'Codestral 25.01' },
  { value: 'mistral-large-24.11', type: 'mistral', label: 'Mistral Large 24.11' },
  { value: 'mistral-large-latest', type: 'mistral', label: 'Mistral Large Latest' },
  { value: 'mistral-medium-latest', type: 'mistral', label: 'Mistral Medium' },
  { value: 'mistral-small-latest', type: 'mistral', label: 'Mistral Small' },

  // Cohere - Latest Models (2024-2025)
  { value: 'command-r-plus', type: 'cohere', label: 'Command R+' },
  { value: 'command-r', type: 'cohere', label: 'Command R' },
  { value: 'command-a', type: 'cohere', label: 'Command A' },
  { value: 'command-light', type: 'cohere', label: 'Command Light' },

  // Perplexity - Latest Models (2025)
  { value: 'sonar', type: 'perplexity', label: 'Sonar' },
  { value: 'sonar-pro', type: 'perplexity', label: 'Sonar Pro' },
] as const

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'switch' | 'password' | 'readonly' | 'url'
  placeholder?: string
  options?: Array<{ value: string; label: string } & Record<string, string>>
  rows?: number
  description?: string
  copyable?: boolean
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  // Additional configuration for switch fields
  showValueWhenEnabled?: boolean
  valueLabel?: string
  valueType?: 'text' | 'textarea'
  valueRows?: number
}

// UI rendering configuration - how fields should be displayed
export const FIELD_METADATA: Record<string, Partial<FieldConfig>> = {
  // Telegram fields
  chatId: {
    label: 'Chat ID',
    type: 'text',
    placeholder: 'Enter chat ID',
    validation: { required: true },
  },
  message: {
    label: 'Message',
    type: 'textarea',
    placeholder: 'Enter your message',
    rows: 4,
    validation: { required: true },
  },

  // Email fields
  to: {
    label: 'To',
    type: 'text',
    placeholder: 'recipient@example.com',
    validation: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
  },
  subject: {
    label: 'Subject',
    type: 'text',
    placeholder: 'Email subject',
    validation: { required: true },
  },
  body: {
    label: 'Body',
    type: 'textarea',
    placeholder: 'Email body',
    rows: 4,
    validation: { required: true },
  },

  // Webhook fields
  method: {
    label: 'HTTP Method',
    type: 'select',
    options: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      // { value: 'DELETE', label: 'DELETE' },
    ],
  },
  path: {
    label: 'Webhook URL',
    type: 'readonly',
    copyable: true,
  },

  secret: {
    label: 'Authenticated',
    type: 'switch',
    description: 'Enable authentication for this webhook',
    showValueWhenEnabled: true,
    valueLabel: 'Authentication Secret',
    valueType: 'textarea',
    valueRows: 2,
  },

  // AI Agent fields
  prompt: {
    label: 'Prompt',
    type: 'textarea',
    placeholder: 'Enter your AI prompt',
    rows: 6,
    validation: { required: true },
  },
  model: {
    label: 'Model',
    type: 'select',
    options: [...AI_MODELS],
  },

  // Manual Trigger fields
  description: {
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe what this trigger does',
    rows: 3,
  },

  // AI Agent Tools fields
  number1: {
    label: 'First Number',
    type: 'text',
    placeholder: 'Enter first number',
    validation: { required: true, pattern: '^\\d+$' },
  },
  number2: {
    label: 'Second Number',
    type: 'text',
    placeholder: 'Enter second number',
    validation: { required: true, pattern: '^\\d+$' },
  },
}
