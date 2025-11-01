import { DocsLayout } from '@/components/docs'

export default function DocsLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>
}
