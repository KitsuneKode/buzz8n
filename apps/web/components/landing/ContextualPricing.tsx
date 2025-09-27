'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@buzz8n/ui/components/card'
import { Badge } from '@buzz8n/ui/components/badge'
import { Button } from '@buzz8n/ui/components/button'
import { Switch } from '@buzz8n/ui/components/switch'
import { 
  Check, 
  Zap, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Building, 
  Rocket 
} from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  monthlyPrice: number
  yearlyPrice: number
  aiCredits: string
  features: string[]
  aiFeatures: string[]
  recommended?: boolean
  cta: string
}

interface ContextualPricingProps {
  className?: string
}

export function ContextualPricing({ className = '' }: ContextualPricingProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'AI Starter',
      description: 'Perfect for individuals exploring AI workflows',
      icon: <Users className="w-5 h-5" />,
      monthlyPrice: 29,
      yearlyPrice: 290,
      aiCredits: '10K AI operations/month',
      features: [
        'Visual workflow builder',
        'Basic integrations (50+)',
        'Community support',
        'Standard templates'
      ],
      aiFeatures: [
        'AI workflow suggestions',
        'Smart node connections',
        'Basic error detection'
      ],
      cta: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'AI Professional',
      description: 'Advanced AI features for growing teams',
      icon: <Building className="w-5 h-5" />,
      monthlyPrice: 99,
      yearlyPrice: 990,
      aiCredits: '100K AI operations/month',
      features: [
        'Everything in Starter',
        'Advanced integrations (200+)',
        'Priority support',
        'Custom templates',
        'Team collaboration',
        'Version control'
      ],
      aiFeatures: [
        'Advanced AI optimization',
        'Predictive error handling',
        'Natural language workflow creation',
        'Performance auto-tuning',
        'Smart debugging assistant'
      ],
      recommended: true,
      cta: 'Start Professional'
    },
    {
      id: 'enterprise',
      name: 'AI Enterprise',
      description: 'Full AI intelligence for large organizations',
      icon: <Rocket className="w-5 h-5" />,
      monthlyPrice: 299,
      yearlyPrice: 2990,
      aiCredits: 'Unlimited AI operations',
      features: [
        'Everything in Professional',
        'Unlimited integrations',
        'Dedicated support',
        'Custom AI models',
        'Advanced security',
        'SLA guarantees',
        'On-premise deployment'
      ],
      aiFeatures: [
        'Custom AI model training',
        'Advanced workflow intelligence',
        'Predictive scaling',
        'AI-powered analytics',
        'Intelligent monitoring',
        'Custom AI assistants'
      ],
      cta: 'Contact Sales'
    }
  ]

  const getPrice = (tier: PricingTier) => {
    return isYearly ? tier.yearlyPrice : tier.monthlyPrice
  }

  const getSavings = (tier: PricingTier) => {
    const monthlyCost = tier.monthlyPrice * 12
    const yearlyCost = tier.yearlyPrice
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100)
  }

  return (
    <section id="pricing" className={`py-24 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge 
            variant="secondary" 
            className="bg-primary/10 text-primary border-primary/20 mb-4"
          >
            <Zap className="w-3 h-3 mr-1" />
            AI Usage Tiers
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pricing That Scales With Your AI Needs
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect AI intelligence level for your workflows. 
            All plans include our core AI features with increasing sophistication.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              Save up to 20%
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card 
                className={`h-full transition-all duration-300 ${
                  tier.recommended 
                    ? 'border-primary/40 shadow-lg shadow-primary/10 bg-card' 
                    : 'border-border bg-card/50 backdrop-blur-sm'
                } ${
                  hoveredTier === tier.id ? 'scale-105 shadow-xl' : ''
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className={`p-2 rounded-lg ${
                      tier.recommended ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {tier.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl text-foreground">
                    {tier.name}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl font-bold text-foreground">
                        ${getPrice(tier)}
                      </span>
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    
                    {isYearly && (
                      <div className="text-sm text-primary font-medium mt-1">
                        Save {getSavings(tier)}% annually
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground mt-2">
                      {tier.aiCredits}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* AI Features */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Brain className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-medium text-foreground">
                        AI Intelligence
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {tier.aiFeatures.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Core Features */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Core Features
                    </h4>
                    <ul className="space-y-2">
                      {tier.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: featureIndex * 0.05 + 0.2 }}
                          viewport={{ once: true }}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`w-full ${
                      tier.recommended 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'bg-background hover:bg-accent text-foreground border border-border'
                    } group transition-all duration-200 hover:scale-105 active:scale-95`}
                    variant={tier.recommended ? 'default' : 'outline'}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-4"
        >
          <p className="text-muted-foreground">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>24/7 AI Monitoring</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
