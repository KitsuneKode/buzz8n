export default function WorkflowLoading() {
  return (
    <div className="pt-16 h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    </div>
  )
}
