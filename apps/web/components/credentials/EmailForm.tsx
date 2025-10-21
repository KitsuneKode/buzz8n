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
import { EmailFormData, emailFormSchema } from '@/lib/types/credentials'
import { Button } from '@buzz8n/ui/components/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@buzz8n/ui/components/input'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

interface EmailFormProps {
  onBack: () => void
  onCancel: () => void
  onSubmit: (data: EmailFormData) => void
}

const EmailForm = ({ onBack, onCancel, onSubmit }: EmailFormProps) => {
  const [showApiKey, setShowApiKey] = useState(false)

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      resendApiKey: '',
    },
  })

  const onFormSubmit = (data: EmailFormData) => {
    console.log('Form submitted:', data)
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
                  <Input placeholder="e.g., My Resend API" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Resend verified email*/}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Resend verified email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., test@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the email address of your verified Resend domain to send test emails.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Resend API Key */}
          <FormField
            control={form.control}
            name="resendApiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Resend API Key <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="re_1234567890abcdef..."
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
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Resend Dashboard
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

export default EmailForm
