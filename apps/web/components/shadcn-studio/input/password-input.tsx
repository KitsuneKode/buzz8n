'use client'

import { useId, useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { cn } from '@buzz8n/ui/lib/utils'

const InputPassword = ({
  defaultValue,
  className,
}: {
  defaultValue: string
  className?: string
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const id = useId()

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* <Label htmlFor={id}>Secret Key</Label> */}
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          placeholder="Password"
          value={defaultValue}
          className={cn(' pr-9 h-10', className)}
          readOnly
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible((prevState) => !prevState)}
          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
        >
          {isVisible ? <EyeOff /> : <Eye />}
          <span className="sr-only">{isVisible ? 'Hide password' : 'Show password'}</span>
        </Button>
      </div>
    </div>
  )
}

export default InputPassword
