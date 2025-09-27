'use client'

import { useState, useCallback } from 'react'
import { Button } from '@buzz8n/ui/components/button'
import { Input } from '@buzz8n/ui/components/input'
import { Label } from '@buzz8n/ui/components/label'
import { Eye, EyeOff } from 'lucide-react'

interface TelegramFormData {
  name: string
  botToken: string
  chatId: string
  sendTestMessage: boolean
  [key: string]: string | boolean | number
}

interface TelegramFormProps {
  onSave: (data: TelegramFormData) => void
  onBack: () => void
  onCancel: () => void
}

const TelegramForm = ({ onSave, onBack, onCancel }: TelegramFormProps) => {
  const [formData, setFormData] = useState<TelegramFormData>({
    name: '',
    botToken: '',
    chatId: '',
    sendTestMessage: false
  })

  const [errors, setErrors] = useState<Partial<TelegramFormData>>({})
  const [showBotToken, setShowBotToken] = useState(false)

  const validateForm = useCallback(() => {
    const newErrors: Partial<TelegramFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Credential name is required'
    }

    if (!formData.botToken.trim()) {
      newErrors.botToken = 'Bot token is required'
    } else if (!formData.botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      newErrors.botToken = 'Invalid bot token format'
    }

    if (!formData.chatId.trim()) {
      newErrors.chatId = 'Chat ID is required'
    } else if (!formData.chatId.match(/^-?\d+$/)) {
      newErrors.chatId = 'Chat ID must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }, [formData, onSave, validateForm])

  const handleInputChange = (field: keyof TelegramFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isFormValid = formData.name.trim() && formData.botToken.trim() && formData.chatId.trim()


  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        {/* Credential Name */}
        <div className="space-y-2">
          <Label htmlFor="credential-name">
            Credential name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="credential-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., My Telegram Bot"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Bot Token */}
        <div className="space-y-2">
          <Label htmlFor="bot-token">
            Bot token <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="bot-token"
              type={showBotToken ? 'text' : 'password'}
              value={formData.botToken}
              onChange={(e) => handleInputChange('botToken', e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
              className={`pr-10 ${errors.botToken ? 'border-destructive' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowBotToken(!showBotToken)}
              className="absolute inset-y-0 right-0 h-full w-10"
            >
              {showBotToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.botToken && (
            <p className="text-sm text-destructive">{errors.botToken}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Get your bot token from{' '}
            <a 
              href="https://t.me/BotFather" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @BotFather
            </a>
          </p>
        </div>

        {/* Chat ID */}
        <div className="space-y-2">
          <Label htmlFor="chat-id">
            Chat ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="chat-id"
            type="text"
            value={formData.chatId}
            onChange={(e) => handleInputChange('chatId', e.target.value)}
            placeholder="e.g., -1001234567890 or 123456789"
            className={errors.chatId ? 'border-destructive' : ''}
          />
          {errors.chatId && (
            <p className="text-sm text-destructive">{errors.chatId}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Use negative numbers for groups/channels, positive for direct messages
          </p>
        </div>

        {/* Send Test Message Toggle */}
        <div className="flex items-center space-x-2">
          <input
            id="send-test"
            type="checkbox"
            checked={formData.sendTestMessage}
            onChange={(e) => handleInputChange('sendTestMessage', e.target.checked)}
            className="rounded border-input"
          />
          <Label htmlFor="send-test" className="text-sm font-normal">
            Send test message after saving
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            Save credential
          </Button>
        </div>
      </div>
    </form>
  )
}

export default TelegramForm
