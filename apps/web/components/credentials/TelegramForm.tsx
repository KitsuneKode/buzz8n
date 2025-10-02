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
import { Checkbox } from '@buzz8n/ui/components/checkbox'
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
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      botToken: '',
      chatId: '',
      sendTestMessage: false,
    },
  })

  const onFormSubmit = (data: TelegramFormData) => {
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

          {/* Chat ID */}
          <FormField
            control={form.control}
            name="chatId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Chat ID <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., -1001234567890 or 123456789" {...field} />
                </FormControl>
                <FormDescription>
                  Use negative numbers for groups/channels, positive for direct messages
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Send Test Message Toggle */}
          <FormField
            control={form.control}
            name="sendTestMessage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Send test message after saving
                </FormLabel>
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
