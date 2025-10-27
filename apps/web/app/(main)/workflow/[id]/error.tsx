'use client'

import { Button } from '@buzz8n/ui/components/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkflowErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function WorkflowError({ error, reset }: WorkflowErrorProps) {
  const router = useRouter()

  return (
    <div className="pt-16 h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load your workflow. This might be due to a network issue or the
            workflow might not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
