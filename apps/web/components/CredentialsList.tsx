'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@buzz8n/ui/components/alert-dialog'
import { getProviderIcon } from '@/components/credentials/ProviderPicker'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Loader2, ChevronDown, Shield } from 'lucide-react'
import { apiClient, getApiErrorMessage } from '@/lib/api-client'
import { useInfiniteCredentials } from '@/hooks/useCredentials'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { CredentialListItem } from '@buzz8n/common/types'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { useDashboardStore } from '@/stores/dashboard'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { Credential } from '@/lib/types/credentials'
import { Badge } from '@buzz8n/ui/components/badge'
import { Card } from '@buzz8n/ui/components/card'
import { useState } from 'react'

function mapCredential(credential: CredentialListItem): Credential {
  return {
    id: credential.id,
    name: credential.title,
    provider: credential.platform,
    createdAt: new Date(credential.createdAt),
  }
}

const CredentialsList = () => {
  const { removeCredential, openCredentialModal } = useDashboardStore()
  const [expandedCredential, setExpandedCredential] = useState<string | null>(null)

  const {
    data: infiniteCredentialsData,
    isLoading,
    error,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCredentials(10)

  const credentials =
    infiniteCredentialsData?.pages.flatMap((page) => page.credentials.map(mapCredential)) || []

  const { sentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  })

  const queryClient = useQueryClient()

  const { isPending, mutate: handleDeleteCredential } = useMutation({
    mutationFn: async (credentialId: string) => {
      const response = await apiClient.delete<CredentialListItem>('/credential', {
        data: { id: credentialId },
      })
      return response.data
    },
    onSuccess: (responseData) => {
      toast.success('Credential successfully deleted')
      removeCredential(responseData.id)
      queryClient.invalidateQueries({
        queryKey: ['credentials', 'infinite'],
      })
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to delete credential'))
    },
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Credentials</h2>
          <p className="text-muted-foreground">Manage your service connections and API keys</p>
        </div>
        <Button onClick={openCredentialModal}>Add credential</Button>
      </div>

      <div className="space-y-2 flex flex-col items-center ">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Loading credentials...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No credentials yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first credential to get started with integrations
            </p>
            <Button onClick={openCredentialModal}>Add First Credential</Button>
          </div>
        ) : (
          <>
            {credentials.map((credential) => {
              const isExpanded = expandedCredential === credential.id

              return (
                <Card key={credential.id} className="relative overflow-hidden w-xl">
                  <motion.div
                    layout
                    initial={false}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCredential(isExpanded ? null : credential.id)}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                        {getProviderIcon(credential.provider)}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {credential.name}
                            </h3>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {credential.provider}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Created {formatDate(credential.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              {isPending ? (
                                <Spinner className="size-4" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will archive the credential. Workflows using it will fail until
                                you attach a new one.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isPending) return
                                  handleDeleteCredential(credential.id)
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="shrink-0"
                        >
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="border-t border-border px-4 pb-4">
                            <div className="pt-4 flex items-start gap-3 text-sm text-muted-foreground">
                              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                              <p>
                                Secret values are encrypted at rest and are not shown in the
                                dashboard. Delete and recreate a credential to rotate keys.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Card>
              )
            })}

            <div ref={sentinelRef} className="py-4">
              {isError && (
                <div className="text-center text-sm text-destructive">
                  Error loading more credentials: {error?.message}
                </div>
              )}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading more credentials...</span>
                </div>
              )}
              {!hasNextPage && credentials.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  No more credentials to load
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CredentialsList
