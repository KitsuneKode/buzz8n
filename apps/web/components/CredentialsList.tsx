'use client'

import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@buzz8n/ui/components/card'
import { Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Credential, useDashboardStore } from '@/stores/dashboard'

interface CredentialsListProps {
  credentials: Credential[]
}

const CredentialsList = ({ credentials }: CredentialsListProps) => {
  const { removeCredential, openCredentialModal } = useDashboardStore()
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())

  const toggleSecretVisibility = (credentialId: string, field: string) => {
    const key = `${credentialId}-${field}`
    setVisibleSecrets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const copyToClipboard = async (text: string, credentialId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      const key = `${credentialId}-${field}`
      setCopiedFields(prev => new Set(prev).add(key))
      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'telegram': return 'bg-blue-500'
      case 'slack': return 'bg-purple-500'
      case 'discord': return 'bg-indigo-500'
      case 'gmail': return 'bg-red-500'
      case 'twilio': return 'bg-orange-500'
      case 'webhook': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const renderConfigField = (credential: Credential, key: string, value: string | boolean | number) => {
    const isSecret = key.toLowerCase().includes('token') || 
                    key.toLowerCase().includes('password') || 
                    key.toLowerCase().includes('secret') ||
                    key.toLowerCase().includes('key')
    
    const secretKey = `${credential.id}-${key}`
    const isVisible = visibleSecrets.has(secretKey)
    const isCopied = copiedFields.has(secretKey)

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      )
    }

    if (typeof value === 'string') {
      const displayValue = isSecret && !isVisible 
        ? '•'.repeat(Math.min(value.length, 20))
        : value

      return (
        <div key={key} className="flex items-center justify-between py-2 group">
          <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          <div className="flex items-center space-x-2">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono max-w-48 truncate">
              {displayValue}
            </code>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              {isSecret && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleSecretVisibility(credential.id, key)}
                >
                  {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(value, credential.id, key)}
              >
                {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Credentials</h2>
          <p className="text-muted-foreground">Manage your service connections and API keys</p>
        </div>
        <Button onClick={openCredentialModal}>
          Add credential
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((credential) => (
          <Card key={credential.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getProviderColor(credential.provider)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold uppercase">
                      {credential.provider.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{credential.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {credential.provider}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCredential(credential.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(credential.config).map(([key, value]) => 
                renderConfigField(credential, key, value)
              )}
              <div className="pt-3 border-t border-border mt-4">
                <span className="text-xs text-muted-foreground">
                  Created {formatDate(credential.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CredentialsList
