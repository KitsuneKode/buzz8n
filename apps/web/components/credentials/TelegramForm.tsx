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
import { TelegramFormData, telegramFormSchema } from '@/lib/types/credentials'
import { Button } from '@buzz8n/ui/components/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@buzz8n/ui/components/input'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

interface TelegramFormProps {
  onBack: () => void
  onCancel: () => void
  onSubmit: (data: TelegramFormData) => void
}

const TelegramForm = ({ onBack, onCancel, onSubmit }: TelegramFormProps) => {
  const [showBotToken, setShowBotToken] = useState(false)

  const form = useForm<TelegramFormData>({
    resolver: zodResolver(telegramFormSchema),
    mode: 'onChange', // Real-time validation as user types
    defaultValues: {
      name: '',
      botToken: '',
    },
  })

  const onFormSubmit = (data: TelegramFormData) => {
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
                  <Input placeholder="e.g., My Telegram Bot" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bot Token */}
          <FormField
            control={form.control}
            name="botToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Bot token <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showBotToken ? 'text' : 'password'}
                      placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBotToken(!showBotToken)}
                    className="absolute inset-y-0 right-0 h-full w-10"
                  >
                    {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <FormDescription>
                  Get your bot token from{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @BotFather
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

export default TelegramForm
