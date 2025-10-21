'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { Textarea } from '@buzz8n/ui/components/textarea'
import { Switch } from '@buzz8n/ui/components/switch'
import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import React from 'react'

// Field configuration interface
export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'switch' | 'password' | 'readonly' | 'url'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
  description?: string
  copyable?: boolean
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

// UI rendering configuration - how fields should be displayed
const FIELD_METADATA: Record<string, Partial<FieldConfig>> = {
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
    options: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'claude-3', label: 'Claude 3' },
    ],
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

// Generate field configurations from defaultConfig using FIELD_METADATA
function generateFieldConfigs(defaultConfig: Record<string, unknown>): FieldConfig[] {
  return Object.keys(defaultConfig).map((key) => {
    const metadata = FIELD_METADATA[key]
    const defaultValue = defaultConfig[key]

    // Use metadata if available, otherwise auto-detect
    const type = metadata?.type || autoDetectFieldType(key, defaultValue)
    const label = metadata?.label || formatLabel(key)
    const rows = metadata?.rows || (type === 'textarea' ? 4 : 1)

    return {
      key,
      label,
      type,
      placeholder: metadata?.placeholder || `Enter ${key.toLowerCase()}`,
      options: metadata?.options,
      rows,
      description: metadata?.description,
      copyable: metadata?.copyable,
      validation: metadata?.validation,
    }
  })
}

// Auto-detect field type based on key patterns and value types
function autoDetectFieldType(key: string, value: unknown): FieldConfig['type'] {
  const keyLower = key.toLowerCase()

  if (
    keyLower.includes('message') ||
    keyLower.includes('body') ||
    keyLower.includes('description')
  ) {
    return 'textarea'
  }
  if (keyLower.includes('secret') || keyLower.includes('password')) {
    return 'password'
  }
  if (keyLower.includes('url') || keyLower.includes('path')) {
    return 'readonly'
  }
  if (keyLower.includes('method') || keyLower.includes('interval')) {
    return 'select'
  }
  if (typeof value === 'boolean') {
    return 'switch'
  }

  return 'text'
}

// Format key into human-readable label
function formatLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
}

interface ConfigRendererProps {
  config: Record<string, unknown>
  onConfigChange: (key: string, value: unknown) => void
  defaultConfig: Record<string, unknown>
  nodeType: string
  baseUrl?: string
}

export function ConfigRenderer({
  config,
  onConfigChange,
  defaultConfig,
  nodeType,
  baseUrl = 'https://buzz8n.kitsulabs.xyz',
}: ConfigRendererProps) {
  const [copied, setCopied] = useState<string | null>(null)

  // Generate field configs from defaultConfig
  const fieldConfigs = generateFieldConfigs(defaultConfig)

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderField = (fieldConfig: FieldConfig) => {
    const { key, label, type, placeholder, options, rows, description, copyable, validation } =
      fieldConfig
    const value = (config[key] as string) || ''

    const handleChange = (newValue: unknown) => {
      onConfigChange(key, newValue)
    }

    const renderInput = () => {
      switch (type) {
        case 'text':
          return (
            <Input
              id={key}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className={validation?.required && !value ? 'border-red-500' : ''}
            />
          )

        case 'textarea':
          return (
            <Textarea
              id={key}
              placeholder={placeholder}
              rows={rows || 4}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className={validation?.required && !value ? 'border-red-500' : ''}
            />
          )

        case 'select':
          return (
            <Select defaultValue={value as string} onValueChange={handleChange}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case 'switch':
          return (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">{label}</Label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
              </div>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => {
                  if (key === 'secret' && checked) {
                    handleChange(crypto.randomUUID())
                  } else {
                    handleChange(checked ? true : null)
                  }
                }}
              />
            </div>
          )

        case 'password':
          return (
            <div className="relative">
              <Input
                id={key}
                type="password"
                placeholder={placeholder}
                value={value as string}
                onChange={(e) => handleChange(e.target.value)}
                className="pr-10"
              />
              {copyable && value && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(value as string, key)}
                  className="absolute right-1 top-1 h-8 w-8"
                >
                  {copied === key ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )

        case 'readonly': {
          const displayValue = key === 'path' ? `${baseUrl}/webhook/${value}` : (value as string)
          return (
            <div className="relative">
              <Textarea
                id={key}
                rows={4}
                value={displayValue}
                readOnly
                className="caret-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-0 focus:outline-none pr-10"
              />
              {copyable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(displayValue, key)}
                  className="absolute right-2 top-2 h-8 w-8"
                >
                  {copied === key ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )
        }

        default:
          return null
      }
    }

    // Special handling for switch type (already includes label)
    if (type === 'switch') {
      return (
        <div key={key} className="space-y-2">
          {renderInput()}
        </div>
      )
    }

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key} className="text-sm font-medium">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderInput()}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {validation?.required && !value && (
          <p className="text-xs text-red-500">This field is required</p>
        )}
      </div>
    )
  }

  if (fieldConfigs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <p>No configuration options available for {nodeType}.</p>
      </div>
    )
  }

  return <div className="space-y-4">{fieldConfigs.map(renderField)}</div>
}

// Helper function to validate config based on field configs
export function validateConfig(
  config: Record<string, unknown>,
  defaultConfig: Record<string, unknown>,
): { isValid: boolean; errors: string[] } {
  const fieldConfigs = generateFieldConfigs(defaultConfig)
  const errors: string[] = []

  fieldConfigs.forEach((field) => {
    const value = config[field.key]
    const validation = field.validation

    if (validation?.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.label} is required`)
    }

    if (value && validation?.minLength && value.toString().length < validation.minLength) {
      errors.push(`${field.label} must be at least ${validation.minLength} characters`)
    }

    if (value && validation?.maxLength && value.toString().length > validation.maxLength) {
      errors.push(`${field.label} must be no more than ${validation.maxLength} characters`)
    }

    if (value && validation?.pattern && !new RegExp(validation.pattern).test(value.toString())) {
      errors.push(`${field.label} format is invalid`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
