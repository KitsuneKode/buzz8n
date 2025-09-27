import { Footer } from '../../components/site/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background pt-16"> {/* Add padding-top for fixed header */}
      {children}
      <Footer />
    </div>
  )
}
