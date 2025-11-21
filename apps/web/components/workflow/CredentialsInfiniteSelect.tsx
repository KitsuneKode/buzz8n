'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { useInfiniteCredentials } from '@/hooks/useCredentials'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { Loader2, Plus } from 'lucide-react'
import { useMemo } from 'react'

interface CredentialsInfiniteSelectProps {
  value: string
  onValueChange: (value: string) => void
  requiredProviders?: string[]
  placeholder?: string
  showBorder?: boolean
}

/**
 * Infinite scrolling select component for credentials with provider filtering.
 * Loads credentials on-demand and caches them. Shows initial 5-6 credentials,
 * then loads more as user scrolls.
 */
export function CredentialsInfiniteSelect({
  value,
  onValueChange,
  requiredProviders = [],
  placeholder = 'Select a credential',
  showBorder = false,
}: CredentialsInfiniteSelectProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteCredentials(6)

  const { sentinelRef } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    fetchNextPage,
  })

  // Flatten and filter credentials
  const filteredCredentials = useMemo(() => {
    if (!data?.pages) return []

    const allCredentials = data.pages.flatMap((page) => page.credentials)

    // Filter by required providers if specified
    if (requiredProviders.length > 0) {
      return allCredentials.filter((cred) =>
        requiredProviders.includes(String(cred.platform).toLowerCase()),
      )
    }

    return allCredentials
  }, [data?.pages, requiredProviders])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={showBorder ? 'border-red-500' : ''}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading credentials...</span>
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No {requiredProviders[0] || ''} credentials found
            </div>
          ) : (
            <>
              {filteredCredentials.map((cred) => (
                <SelectItem key={cred.id} value={cred.id}>
                  {cred.title}
                </SelectItem>
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-2">
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    <span className="text-xs text-muted-foreground">Loading more...</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Create new credential option */}
          <SelectItem value="create-new" className="border-t">
            <div className="flex items-center gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Create new credential
            </div>
          </SelectItem>
        </div>
      </SelectContent>
    </Select>
  )
}
