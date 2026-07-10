'use client'

import {
  CredentialData,
  Provider,
  TelegramFormData,
  EmailFormData,
  OpenAIFormData,
  GeminiFormData,
  AnthropicFormData,
} from '@/lib/types/credentials'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@buzz8n/ui/components/dialog'
import { CredentialResponse } from '@buzz8n/common/types/credentials'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useDashboardStore } from '@/stores/dashboard'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import ProviderPicker from './ProviderPicker'
import { useEffect, useState } from 'react'
import axios, { isAxiosError } from 'axios'
import TelegramForm from './TelegramForm'
import { API_URL } from '@/utils/config'
import OpenAIForm from './OpenAIForm'
import GeminiForm from './GeminiForm'
import ClaudeForm from './ClaudeForm'
import OAuthForm from './OAuthForm'
import EmailForm from './EmailForm'

const CredentialModal = () => {
  const [step, setStep] = useState<'provider' | 'form'>('provider')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const {
    setCredentialModalOpen,
    isCredentialModalOpen: isOpen,
    addCredential,
    credentialCreationContext,
    setCredentialCreationContext,
  } = useDashboardStore()

  const { setSelectedNodeCredentialRef } = useWorkflowEditorStore()

  const queryClient = useQueryClient()

  const onClose = () => {
    setCredentialModalOpen(false)
    setCredentialCreationContext(null)
  }

  useEffect(() => {
    if (!isOpen) {
      setStep('provider')
      setSelectedProvider(null)
    }
  }, [isOpen])

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
    setStep('form')
  }

  const handleBack = () => {
    setStep('provider')
    setSelectedProvider(null)
  }
  const { mutate: saveCredentialMuate } = useMutation({
    mutationFn: async (credentialData: CredentialData) => {
      const payload = {
        title: credentialData.name,
        platform: credentialData.provider,
        data: credentialData.config,
      }

      const response = await axios.post<CredentialResponse>(`${API_URL}/credential`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      return response.data
    },
    onSuccess: (responseData: CredentialResponse) => {
      const newCredential = {
        id: responseData.id,
        name: responseData.title,
        provider: responseData.platform,
        config: responseData.data,
        createdAt: responseData.createdAt,
      }

      addCredential(newCredential)

      // Auto-select if created from workflow editor
      if (credentialCreationContext === 'workflow-editor') {
        setSelectedNodeCredentialRef({
          id: newCredential.id,
          name: newCredential.name,
          provider: newCredential.provider,
        })
        toast.success('Credential created and selected')
      } else {
        toast.success('Credential created successfully')
      }

      // Invalidate infinite credentials cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['credentials', 'infinite'],
      })

      setCredentialModalOpen(false)
      setCredentialCreationContext(null)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(getApiErrorMessage(error, 'Failed to create credentials'))
      }
    },
  })

  const handleFormSubmit = async (
    formData:
      | TelegramFormData
      | EmailFormData
      | OpenAIFormData
      | GeminiFormData
      | AnthropicFormData,
  ) => {
    if (!selectedProvider) {
      toast.error('Please select a provider')
      return
    }
    saveCredentialMuate({
      config: formData,
      name: formData.name,
      provider: selectedProvider,
    })
  }

  const handleOAuthFormSubmit = async (formData: {
    name: string
    accessToken?: string
    refreshToken?: string
  }) => {
    if (!selectedProvider) {
      toast.error('Please select a provider')
      return
    }
    saveCredentialMuate({
      config: formData,
      name: formData.name,
      provider: selectedProvider,
    })
  }

  const getModalTitle = () => {
    if (step === 'provider') {
      return 'New credential'
    }
    if (selectedProvider) {
      return `New credential → ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}`
    }
    return 'New credential'
  }

  const renderFormComponent = () => {
    switch (selectedProvider) {
      case 'Telegram':
        return <TelegramForm onBack={handleBack} onSubmit={handleFormSubmit} onCancel={onClose} />
      case 'Email':
        return <EmailForm onBack={handleBack} onSubmit={handleFormSubmit} onCancel={onClose} />
      case 'OpenAI':
        return <OpenAIForm onBack={handleBack} onSubmit={handleFormSubmit} onCancel={onClose} />
      case 'Gemini':
        return <GeminiForm onBack={handleBack} onSubmit={handleFormSubmit} onCancel={onClose} />
      case 'Anthropic':
        return <ClaudeForm onBack={handleBack} onSubmit={handleFormSubmit} onCancel={onClose} />
      case 'Gmail':
        return (
          <OAuthForm
            provider="gmail"
            onBack={handleBack}
            onSubmit={handleOAuthFormSubmit}
            onCancel={onClose}
          />
        )
      case 'Discord':
        return (
          <OAuthForm
            provider="discord"
            onBack={handleBack}
            onSubmit={handleOAuthFormSubmit}
            onCancel={onClose}
          />
        )
      case 'Slack':
        return (
          <OAuthForm
            provider="slack"
            onBack={handleBack}
            onSubmit={handleOAuthFormSubmit}
            onCancel={onClose}
          />
        )
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Form for {selectedProvider} is not implemented yet.
            </p>
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {step === 'provider' ? (
            <ProviderPicker onSelect={handleProviderSelect} />
          ) : (
            renderFormComponent()
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CredentialModal
