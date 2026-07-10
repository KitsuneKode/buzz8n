import { Skeleton } from '@buzz8n/ui/components/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto pt-18 px-6 py-6 space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  )
}
