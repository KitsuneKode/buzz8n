'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@buzz8n/ui/components/dialog'
import { CredentialData, Provider, TelegramFormData } from '@/lib/types/credentials'
import { CredentialResponse } from '@buzz8n/common/types/credentials'
import { useDashboardStore } from '@/stores/dashboard'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { useMutation } from '@tanstack/react-query'
import ProviderPicker from './ProviderPicker'
import { useEffect, useState } from 'react'
import axios, { isAxiosError } from 'axios'
import TelegramForm from './TelegramForm'
import { API_URL } from '@/utils/config'

const CredentialModal = () => {
  const [step, setStep] = useState<'provider' | 'form'>('provider')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const {
    setCredentialModalOpen,
    isCredentialModalOpen: isOpen,
    addCredential,
  } = useDashboardStore()

  const onClose = () => setCredentialModalOpen(false)

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

      console.log(credentialData, 'data to be foning to db')
      const response = await axios.post<CredentialResponse>(`${API_URL}/credential`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      return response.data
    },
    onSuccess: (responseData: CredentialResponse) => {
      addCredential({
        id: responseData.id,
        name: responseData.title,
        provider: responseData.platform,
        config: responseData.data,
        createdAt: responseData.createdAt,
      })
      setCredentialModalOpen(false)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.data) {
          toast.error(error.response.data)
        } else {
          toast.error('Failed to create credentials')
        }
      }
    },
  })

  const handleFormSubmit = async (formData: TelegramFormData) => {
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
