'use client'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@buzz8n/ui/components/form'
import { GeminiFormData, geminiFormSchema } from '@/lib/types/credentials'
import { Button } from '@buzz8n/ui/components/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@buzz8n/ui/components/input'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

interface GeminiFormProps {
  onBack: () => void
  onCancel: () => void
  onSubmit: (data: GeminiFormData) => void
}

const GeminiForm = ({ onBack, onCancel, onSubmit }: GeminiFormProps) => {
  const [showApiKey, setShowApiKey] = useState(false)

  const form = useForm<GeminiFormData>({
    resolver: zodResolver(geminiFormSchema),
    mode: 'onChange', // Real-time validation as user types
    defaultValues: {
      name: '',
      geminiApiKey: '',
      platform: 'gemini',
    },
  })

  const onFormSubmit = (data: GeminiFormData) => {
    onSubmit?.(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Credential Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Credential name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., My Gemini API" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gemini API Key */}
          <FormField
            control={form.control}
            name="geminiApiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gemini API Key <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AIzaSyD1234567890abcdef..."
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 h-full w-10"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <FormDescription>
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>

          <div className="flex space-x-3">
            <Button
              disabled={form.formState.isSubmitting}
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting} type="submit">
              Save credential
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default GeminiForm
