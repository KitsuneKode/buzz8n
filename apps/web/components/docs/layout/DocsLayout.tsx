import { DocsSidebar } from './DocsSidebar'

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DocsSidebar />
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
          <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:my-4 prose-p:leading-7 prose-li:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            {children}
          </article>
        </div>
      </main>
    </div>
  )
}
