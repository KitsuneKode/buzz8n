'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@buzz8n/ui/components/card'
import { Checkbox } from '@buzz8n/ui/components/checkbox'
import { ExternalLink, Info, Lock } from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState } from 'react'

interface OAuthFormProps {
  provider: 'gmail' | 'discord' | 'slack'
  onBack: () => void
  onCancel: () => void
  onSubmit: (data: { name: string; accessToken?: string; refreshToken?: string }) => void
}

const providerConfig = {
  gmail: {
    name: 'Gmail',
    icon: '📧',
    color: 'bg-red-50 border-red-200',
    docsUrl: 'https://developers.google.com/gmail/api/guides',
    availableScopes: [
      {
        id: 'gmail.send',
        label: 'Send emails',
        value: 'https://www.googleapis.com/auth/gmail.send',
        required: true,
      },
      {
        id: 'gmail.readonly',
        label: 'Read emails',
        value: 'https://www.googleapis.com/auth/gmail.readonly',
        required: false,
      },
      {
        id: 'gmail.modify',
        label: 'Modify emails',
        value: 'https://www.googleapis.com/auth/gmail.modify',
        required: false,
      },
      {
        id: 'gmail.labels',
        label: 'Manage labels',
        value: 'https://www.googleapis.com/auth/gmail.labels',
        required: false,
      },
    ],
    instructions: [
      'Go to Google Cloud Console',
      'Create or select a project',
      'Enable Gmail API',
      'Create OAuth 2.0 credentials',
      'Add authorized redirect URI',
      'Copy Client ID and Client Secret',
    ],
  },
  discord: {
    name: 'Discord',
    icon: '💬',
    color: 'bg-indigo-50 border-indigo-200',
    docsUrl: 'https://discord.com/developers/docs/topics/oauth2',
    availableScopes: [
      { id: 'identify', label: 'Access user info', value: 'identify', required: true },
      { id: 'email', label: 'Access email', value: 'email', required: false },
      { id: 'guilds', label: 'Access servers', value: 'guilds', required: false },
      { id: 'messages.read', label: 'Read messages', value: 'messages.read', required: false },
      { id: 'bot', label: 'Add as bot', value: 'bot', required: false },
    ],
    instructions: [
      'Go to Discord Developer Portal',
      'Create a new application',
      'Navigate to OAuth2 settings',
      'Add redirect URI',
      'Copy Client ID and Client Secret',
      'Generate OAuth2 URL with required scopes',
    ],
  },
  slack: {
    name: 'Slack',
    icon: '💼',
    color: 'bg-purple-50 border-purple-200',
    docsUrl: 'https://api.slack.com/authentication/oauth-v2',
    availableScopes: [
      { id: 'chat:write', label: 'Send messages', value: 'chat:write', required: true },
      { id: 'channels:read', label: 'View channels', value: 'channels:read', required: false },
      { id: 'users:read', label: 'View users', value: 'users:read', required: false },
      { id: 'files:write', label: 'Upload files', value: 'files:write', required: false },
      { id: 'reactions:write', label: 'Add reactions', value: 'reactions:write', required: false },
    ],
    instructions: [
      'Go to Slack API Dashboard',
      'Create a new app',
      'Navigate to OAuth & Permissions',
      'Add redirect URL',
      'Add required OAuth scopes',
      'Install app to workspace',
    ],
  },
}

//TODO: Implement actual OAuth flow when backend is ready

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OAuthForm = ({ provider, onBack, onCancel, onSubmit }: OAuthFormProps) => {
  const config = providerConfig[provider]
  const [credentialName, setCredentialName] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    config.availableScopes.filter((s) => s.required).map((s) => s.id),
  )
  // Disabled for now until backend OAuth is implemented
  // const [isConnecting, setIsConnecting] = useState(false)
  // const [isConnected, setIsConnected] = useState(false)

  const handleScopeToggle = (scopeId: string, isRequired: boolean) => {
    if (isRequired) return // Can't uncheck required scopes

    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId],
    )
  }

  // DISABLED: OAuth backend not implemented yet
  // TODO: Implement actual OAuth flow when backend is ready
  // This will redirect to OAuth provider and handle the callback
  /*
  const handleOAuthConnect = () => {
    setIsConnecting(true)
    // Redirect to OAuth provider
    window.location.href = `/api/oauth/${provider}/init?scopes=${selectedScopes.join(',')}`
  }
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // DISABLED: OAuth backend not implemented yet
    return

    /*
    onSubmit({
      name: credentialName,
      // TODO: These will come from OAuth callback
      accessToken: 'placeholder-access-token',
      refreshToken: 'placeholder-refresh-token',
    })
    */
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{config.name} OAuth</h3>
            <p className="text-sm text-muted-foreground">Connect using OAuth 2.0</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
          <Lock className="w-3 h-3 mr-1" />
          Not Available Yet
        </Badge>
      </div>

      {/* Credential Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Credential name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={credentialName}
          onChange={(e) => setCredentialName(e.target.value)}
          placeholder={`My ${config.name} Account`}
          required
        />
      </div>

      {/* OAuth Configuration Card */}
      <Card className={`${config.color} border-2`}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            OAuth Setup Instructions
          </CardTitle>
          <CardDescription>Follow these steps to configure OAuth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="space-y-2">
            {config.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">
                  {index + 1}
                </Badge>
                <span className="text-sm">{instruction}</span>
              </div>
            ))}
          </div>

          {/* Documentation Link */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(config.docsUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View {config.name} Documentation
          </Button>
        </CardContent>
      </Card>

      {/* OAuth Credentials Input */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="space-y-2">
          <Label htmlFor="clientId">
            Client ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Your OAuth client ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientSecret">
            Client Secret <span className="text-destructive">*</span>
          </Label>
          <Input
            id="clientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Your OAuth client secret"
            required
          />
        </div>
      </div>

      {/* Scopes Selection */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">OAuth Scopes</Label>
          <Badge variant="outline" className="text-xs">
            {selectedScopes.length} selected
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Select the permissions you want to grant. Required scopes cannot be deselected.
        </p>
        <div className="space-y-3">
          {config.availableScopes.map((scope) => {
            const isSelected = selectedScopes.includes(scope.id)
            const isDisabled = scope.required

            return (
              <div key={scope.id} className="flex items-start space-x-3">
                <Checkbox
                  id={scope.id}
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => handleScopeToggle(scope.id, scope.required)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={scope.id}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 ${
                      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {scope.label}
                    {scope.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{scope.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* OAuth Connect Button - DISABLED */}
      <div className="space-y-4">
        <Button type="button" variant="default" className="w-full" disabled={true}>
          <Lock className="w-4 h-4 mr-2" />
          OAuth Flow Not Available Yet
        </Button>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Coming Soon:</strong> OAuth authentication is currently being implemented on the
            backend. This UI is ready and will be activated once the OAuth flow is complete.
          </p>
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
          <Button type="submit" disabled={true}>
            Save credential
          </Button>
        </div>
      </div>
    </form>
  )
}

export default OAuthForm
