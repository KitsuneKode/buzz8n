import { IntelligentHero } from '../../components/landing/IntelligentHero'
import { AdaptiveFeatureGrid } from '../../components/landing/AdaptiveFeatureGrid'
import { InteractiveDemo } from '../../components/landing/InteractiveDemo'
import { IntelligenceShowcase } from '../../components/landing/IntelligenceShowcase'
import { ContextualPricing } from '../../components/landing/ContextualPricing'
import { SmartFAQ } from '../../components/landing/SmartFAQ'

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
