'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { Popover, PopoverContent, PopoverTrigger } from '@buzz8n/ui/components/popover'

import { FIELD_METADATA, FieldConfig } from '@/utils/config-template'
import InputPassword from '../shadcn-studio/input/password-input'
import { validateTemplates } from '@/utils/template-validation'
import CopyButton from '../shadcn-studio/button/copy-button'
import { HighlightedTextarea } from './HighlightedTextarea'
import { Textarea } from '@buzz8n/ui/components/textarea'
import { WEBHOOK_URL, NODE_ENV } from '@/utils/config'
import { Switch } from '@buzz8n/ui/components/switch'
import { Button } from '@buzz8n/ui/components/button'
import { HighlightedInput } from './HighlightedInput'
import { CredentialRef } from '@buzz8n/common/types'
import { Check, Copy, Sparkles } from 'lucide-react'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { VariablePicker } from './VariablePicker'
import { useState } from 'react'
/**
 * Build an ordered array of FieldConfig objects for every key in a baseline configuration.
 *
 * @param defaultConfig - A mapping of field keys to their default values used as the baseline for generating UI field configurations
 * @returns An array of FieldConfig objects where each entry merges FIELD_METADATA (when present) with inferred properties (type, label, rows, placeholder, options, description, copyable, validation) for the corresponding key
 */
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

/**
 * Infers the most appropriate field type for a configuration entry based on its key and value.
 *
 * Uses simple heuristics: certain substrings in the key map to specific UI types (e.g., message/body -> textarea, secret/password -> password, url/path -> readonly, method/interval -> select), and a boolean value maps to `switch`. Falls back to `text` when no heuristic matches.
 *
 * @param key - The configuration key to analyze (e.g., "webhookUrl", "messageBody")
 * @param value - The current value for the key; used to detect boolean fields
 * @returns One of the field type strings: 'text', 'textarea', 'select', 'switch', 'password', or 'readonly'
 */
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

/**
 * Convert a camelCase or PascalCase key into a human-readable label.
 *
 * @param key - The identifier to format (e.g., `webhookUrl`, `requestBody`)
 * @returns The label with spaces inserted before capital letters and the first character capitalized (e.g., `Webhook Url`, `Request Body`)
 */
function formatLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
}

interface ConfigRendererProps {
  config: Record<string, unknown>
  selectedCredential: CredentialRef | undefined
  onConfigChange: (key: string, value: unknown) => void
  defaultConfig: Record<string, unknown>
  nodeType: string
  nodeId?: string
  baseUrl?: string
}

/**
 * Renders a dynamic configuration form based on a provided default configuration and current values.
 *
 * The component generates field metadata from `defaultConfig`, auto-detects input types when needed,
 * and renders appropriate inputs (text, textarea, select, switch, password, readonly). It wires user
 * interactions to `onConfigChange`, supports copy-to-clipboard for copyable fields, shows required
 * validation hints, and displays an empty-state message when no fields are available.
 *
 * @param config - Current configuration values keyed by field name
 * @param onConfigChange - Callback invoked as `onConfigChange(key, value)` when a field value changes
 * @param defaultConfig - Baseline configuration used to derive field configs and validation rules
 * @param nodeType - Human-readable name of the node type (used in the empty-state message)
 * @param baseUrl - Optional base URL used to build display values for path-like readonly fields
 * @returns The rendered configuration form as a React element
 */

export function ConfigRenderer({
  config,
  onConfigChange,
  selectedCredential,
  defaultConfig,
  nodeType,
  nodeId,
  baseUrl = NODE_ENV === 'development' ? 'http://localhost:8080/webhook' : WEBHOOK_URL,
}: ConfigRendererProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [expressionMode, setExpressionMode] = useState<Record<string, boolean>>({})
  const [pickerOpen, setPickerOpen] = useState<string | null>(null)

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
    const isExpression = expressionMode[key] || value.includes('{{')

    const handleChange = (newValue: unknown) => {
      onConfigChange(key, newValue)
    }

    const renderInput = () => {
      switch (type) {
        case 'text':
          return isExpression ? (
            <HighlightedInput
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              placeholder="e.g., {{ $json.body.email }}"
              // nodeId={nodeId}
            />
          ) : (
            <Input
              id={key}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className={validation?.required && !value ? 'border-red-500' : ''}
            />
          )

        case 'textarea':
          return isExpression ? (
            <HighlightedTextarea
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              placeholder="e.g., {{ $json.body.message }}"
              // nodeId={nodeId}
              rows={rows || 4}
              className={validation?.required && !value ? 'border-red-500' : ''}
            />
          ) : (
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
                {label === 'Model' ? (
                  selectedCredential ? (
                    options?.map(
                      (option) =>
                        selectedCredential.provider.toLowerCase() === option.type && (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ),
                    )
                  ) : (
                    <SelectItem key="no-credential-selected" value="no-credential-selected">
                      No model selected
                    </SelectItem>
                  )
                ) : (
                  options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )

        case 'switch':
          return (
            <div className="space-y-2">
              {/* Show secret value when authentication is enabled */}
              {key === 'secret' && value && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm ">Authentication Secret</Label>
                    <CopyButton
                      copyTag="Copy Secret"
                      copyContent={value as string}
                      className="text-xs dark:bg-primary/50 dark:hover:bg-primary/40 "
                    />
                  </div>
                  <div className="relative">
                    <InputPassword
                      defaultValue={value as string}
                      className="h-10 row-4 caret-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-0 focus:outline-none pr-10 bg-muted/50"
                    />
                  </div>
                </div>
              )}
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
          const displayValue = key === 'path' ? `${baseUrl}/${value}` : (value as string)
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

    // For text and textarea fields, add expression mode
    if (type === 'text' || type === 'textarea') {
      return (
        <div key={key} className="space-y-2 relative">
          {/* Label with expression toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm font-medium">
              {label}
              {validation?.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpressionMode((prev) => ({ ...prev, [key]: !prev[key] }))}
              className="h-7 text-xs"
            >
              {isExpression ? '🔢 Fixed' : '✨ Expression'}
            </Button>
          </div>

          {/* Input field */}
          {renderInput()}

          {/* Insert variable button */}
          {isExpression && nodeId && (
            <Popover
              open={pickerOpen === key}
              onOpenChange={(open) => !open && setPickerOpen(null)}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(key)}
                  className="mt-1"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Insert Variable
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <VariablePicker
                  currentNodeId={nodeId}
                  onInsert={(template) => {
                    onConfigChange(key, value + template)
                    setPickerOpen(null)
                  }}
                  onClose={() => setPickerOpen(null)}
                />
              </PopoverContent>
            </Popover>
          )}

          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {validation?.required && !value && (
            <p className="text-xs text-red-500">This field is required</p>
          )}
        </div>
      )
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
      <div key={key} className="space-y-2 mt-4">
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

/**
 * Validate a config object against validation rules derived from a default configuration.
 *
 * Derives field validation requirements from the provided default configuration and checks
 * each corresponding value in `config` for requiredness, minimum/maximum length, and pattern.
 *
 * @param config - Mapping of field keys to their current values to validate
 * @param defaultConfig - Baseline configuration used to derive field validation rules
 * @returns An object with `isValid` (`true` if no validation errors, `false` otherwise) and `errors` (array of human-readable error messages)
 */
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

  // Add template validation
  const templateErrors = validateTemplates(config)
  errors.push(...templateErrors)

  return {
    isValid: errors.length === 0,
    errors,
  }
}
