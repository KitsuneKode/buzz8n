'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@buzz8n/ui/components/dialog'
import { Button } from '@buzz8n/ui/components/button'
import ProviderPicker from './ProviderPicker'
import TelegramForm from './TelegramForm'

export type Provider = 'telegram' | 'slack' | 'discord' | 'twilio' | 'gmail' | 'webhook'

export interface CredentialData {
  provider: Provider
  name: string
  config: Record<string, string | boolean | number>
}

interface CredentialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CredentialData) => void
}

const CredentialModal = ({ isOpen, onClose, onSave }: CredentialModalProps) => {
  const [step, setStep] = useState<'provider' | 'form'>('provider')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

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

  const handleFormSave = (formData: { name: string; [key: string]: string | boolean | number }) => {
    if (selectedProvider) {
      const { name, ...config } = formData
      onSave({
        provider: selectedProvider,
        name,
        config
      })
    }
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
      case 'telegram':
        return <TelegramForm onSave={handleFormSave} onBack={handleBack} onCancel={onClose} />
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Form for {selectedProvider} is not implemented yet.</p>
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
