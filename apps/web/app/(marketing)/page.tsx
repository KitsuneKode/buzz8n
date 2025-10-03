import { IntelligenceShowcase } from '@/components/landing/IntelligenceShowcase'
import { AdaptiveFeatureGrid } from '@/components/landing/AdaptiveFeatureGrid'
import { ContextualPricing } from '@/components/landing/ContextualPricing'
import { InteractiveDemo } from '@/components/landing/InteractiveDemo'
import { IntelligentHero } from '@/components/landing/IntelligentHero'
import { SmartFAQ } from '@/components/landing/SmartFAQ'

export default function LandingPage() {
  return (
    <>
      <IntelligentHero />
      <AdaptiveFeatureGrid />
      <InteractiveDemo />
      <IntelligenceShowcase />
      <ContextualPricing />
      <SmartFAQ />
    </>
  )
}
