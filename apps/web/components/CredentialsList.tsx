'use client'

import { Trash2, Eye, EyeOff, Copy, Check, Loader2, ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CredentialResponse } from '@buzz8n/common/types'
import { useDashboardStore } from '@/stores/dashboard'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { Credential } from '@/lib/types/credentials'
import { Badge } from '@buzz8n/ui/components/badge'
import { Card } from '@buzz8n/ui/components/card'
import { API_URL } from '@/utils/config'
import { useState } from 'react'
import axios from 'axios'

interface CredentialsListProps {
  credentials: Credential[]
}

const CredentialsList = ({ credentials }: CredentialsListProps) => {
  const { removeCredential, openCredentialModal } = useDashboardStore()
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())
  const [expandedCredential, setExpandedCredential] = useState<string | null>(null)

  const toggleSecretVisibility = (credentialId: string, field: string) => {
    const key = `${credentialId}-${field}`
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const queryClient = useQueryClient()

  const { isPending, mutate: handleDeleteCredential } = useMutation({
    mutationFn: async (credentialId: string) => {
      const response = await axios.delete(`${API_URL}/credential`, {
        data: {
          id: credentialId,
        },
        withCredentials: true,
      })

      return response.data
    },

    onSuccess: (responseData) => {
      toast.success('Credential successfully deleted')

      removeCredential(responseData.id)

      queryClient.setQueryData(['credential'], (old: Array<CredentialResponse>) =>
        old.filter((c) => c.id !== responseData.id),
      )
    },
    onError: () => {
      toast.error('Failed to delete credential')
    },
  })

  const copyToClipboard = async (text: string, credentialId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      const key = `${credentialId}-${field}`
      setCopiedFields((prev) => new Set(prev).add(key))
      setTimeout(() => {
        setCopiedFields((prev) => {
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
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'Telegram':
        return 'bg-blue-500'
      case 'Slack':
        return 'bg-purple-500'
      case 'Discord':
        return 'bg-indigo-500'
      case 'Gmail':
        return 'bg-red-500'
      case 'Twilio':
        return 'bg-orange-500'
      case 'Webhook':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const renderConfigField = (
    credential: Credential,
    key: string,
    value: string | boolean | number,
  ) => {
    const isSecret =
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('key')

    const secretKey = `${credential.id}-${key}`
    const isVisible = visibleSecrets.has(secretKey)
    const isCopied = copiedFields.has(secretKey)

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </span>
          <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Enabled' : 'Disabled'}</Badge>
        </div>
      )
    }

    if (typeof value === 'string') {
      const displayValue = isSecret && !isVisible ? '•'.repeat(Math.min(value.length, 20)) : value

      return (
        <div key={key} className="flex items-center justify-between py-2 group">
          <span className="text-sm text-muted-foreground capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </span>
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
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Credentials</h2>
          <p className="text-muted-foreground">Manage your service connections and API keys</p>
        </div>
        <Button onClick={openCredentialModal}>Add credential</Button>
      </div>

      <div className="space-y-2 flex flex-col items-center ">
        {credentials.map((credential) => {
          const isExpanded = expandedCredential === credential.id

          return (
            <Card key={credential.id} className="relative overflow-hidden w-xl">
              <motion.div layout initial={false} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                {/* List Item - Always Visible */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedCredential(isExpanded ? null : credential.id)}
                >
                  {/* Provider Icon */}
                  <div
                    className={`w-10 h-10 ${getProviderColor(credential.provider)} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white text-sm font-bold uppercase">
                      {credential.provider?.charAt(0).toUpperCase() +
                        credential.provider?.charAt(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">
                          {credential.name}
                        </h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {credential.provider}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Created {formatDate(credential.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCredential(credential.id)
                      }}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && credential.config && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="border-t border-border px-4 pb-4 space-y-1">
                        <div className="pt-4 pb-2">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            Configuration Details
                          </h4>
                        </div>
                        {Object.entries(credential.config).map(([key, value]) =>
                          renderConfigField(credential, key, value),
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default CredentialsList
