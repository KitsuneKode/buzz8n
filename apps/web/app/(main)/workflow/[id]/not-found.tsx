import { HelpCircle, Home as HomeIcon, LayoutDashboard, Plus } from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-16 h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <HelpCircle className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Workflow not found</h2>
          <p className="text-muted-foreground">
            The workflow you&apos;re looking for doesn&apos;t exist or you might not have access.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="secondary">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard?create=true">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
