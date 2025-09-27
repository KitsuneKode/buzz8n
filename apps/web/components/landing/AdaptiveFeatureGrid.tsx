'use client'

import {
  Brain,
  Zap,
  Network,
  Target,
  Lightbulb,
  Gauge,
  Shield,
  Workflow,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@buzz8n/ui/components/card'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface Feature {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  aiCapability: string
  metrics: {
    improvement: string
    timeReduction: string
  }
  category: 'intelligence' | 'automation' | 'optimization' | 'security'
}

interface AdaptiveFeatureGridProps {
  className?: string
}

export function AdaptiveFeatureGrid({ className = '' }: AdaptiveFeatureGridProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [visibleFeatures, setVisibleFeatures] = useState<string[]>([])

  const features: Feature[] = [
    {
      id: 'smart-suggestions',
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart Workflow Suggestions',
      description:
        'AI analyzes your data patterns and suggests optimal workflow configurations automatically.',
      aiCapability: 'LLM-powered pattern recognition',
      metrics: { improvement: '85%', timeReduction: '60%' },
      category: 'intelligence',
    },
    {
      id: 'auto-connections',
      icon: <Network className="w-6 h-6" />,
      title: 'Auto-Generated Connections',
      description:
        'Intelligent node linking based on data types, API compatibility, and workflow logic.',
      aiCapability: 'Semantic understanding of data flow',
      metrics: { improvement: '92%', timeReduction: '75%' },
      category: 'automation',
    },
    {
      id: 'error-handling',
      icon: <Shield className="w-6 h-6" />,
      title: 'Intelligent Error Handling',
      description:
        'AI predicts potential failures and automatically implements robust error handling strategies.',
      aiCapability: 'Predictive error analysis',
      metrics: { improvement: '78%', timeReduction: '45%' },
      category: 'security',
    },
    {
      id: 'optimization',
      icon: <Gauge className="w-6 h-6" />,
      title: 'Real-time Optimization',
      description:
        'Continuous AI monitoring optimizes workflow performance and resource allocation.',
      aiCapability: 'Dynamic performance tuning',
      metrics: { improvement: '65%', timeReduction: '40%' },
      category: 'optimization',
    },
    {
      id: 'tool-recommendations',
      icon: <Target className="w-6 h-6" />,
      title: 'Context-Aware Tool Recommendations',
      description:
        'AI suggests the best tools and integrations based on your specific use case and data.',
      aiCapability: 'Contextual tool matching',
      metrics: { improvement: '88%', timeReduction: '55%' },
      category: 'intelligence',
    },
    {
      id: 'workflow-generation',
      icon: <Workflow className="w-6 h-6" />,
      title: 'Natural Language Workflow Creation',
      description:
        'Describe your process in plain English and watch AI build the complete workflow.',
      aiCapability: 'Natural language processing',
      metrics: { improvement: '95%', timeReduction: '80%' },
      category: 'automation',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureId = entry.target.getAttribute('data-feature-id')
            if (featureId && !visibleFeatures.includes(featureId)) {
              setVisibleFeatures((prev) => [...prev, featureId])
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    const featureElements = document.querySelectorAll('[data-feature-id]')
    featureElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [visibleFeatures])

  const getCategoryColor = (category: Feature['category']) => {
    const colors = {
      intelligence: 'text-primary bg-primary/10 border-primary/20',
      automation: 'text-secondary bg-secondary/10 border-secondary/20',
      optimization: 'text-chart-3 bg-chart-3/10 border-chart-3/20',
      security: 'text-chart-1 bg-chart-1/10 border-chart-1/20',
    }
    return colors[category]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="features" className={`py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Lightbulb className="w-3 h-3 mr-1" />
            AI-First Features
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Intelligence That Adapts
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI doesn't just automate—it thinks, learns, and evolves with your workflows.
            Experience the next generation of intelligent process automation.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              data-feature-id={feature.id}
              className="group"
            >
              <Card
                className={`h-full transition-all duration-300 hover:shadow-lg border-border bg-card/50 backdrop-blur-sm ${
                  hoveredFeature === feature.id ? 'border-primary/40 shadow-primary/10' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <motion.div
                      className={`p-3 rounded-lg transition-colors duration-200 ${getCategoryColor(feature.category)}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {feature.icon}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: hoveredFeature === feature.id ? 1 : 0,
                        scale: hoveredFeature === feature.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* AI Capability Badge */}
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        {feature.aiCapability}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <motion.div
                    className="pt-4 border-t border-border/50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: hoveredFeature === feature.id ? 1 : 0.7,
                      height: 'auto',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {feature.metrics.improvement}
                        </div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary">
                          {feature.metrics.timeReduction}
                        </div>
                        <div className="text-xs text-muted-foreground">Time Saved</div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to experience AI-powered workflow intelligence?
          </p>
          <motion.button
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            whileHover={{ x: 5 }}
          >
            <span>See all AI features</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
