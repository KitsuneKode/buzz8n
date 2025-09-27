'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@buzz8n/ui/components/card'
import { Badge } from '@buzz8n/ui/components/badge'
import { Button } from '@buzz8n/ui/components/button'
import { 
  ChevronDown, 
  MessageSquare, 
  Lightbulb, 
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'ai' | 'technical' | 'pricing' | 'integration'
  relatedQuestions: string[]
}

interface SmartFAQProps {
  className?: string
}

export function SmartFAQ({ className = '' }: SmartFAQProps) {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [, setExpandedRelated] = useState<string[]>([])

  const faqs: FAQ[] = [
    {
      id: 'ai-intelligence',
      question: 'How does the AI actually understand my workflow requirements?',
      answer: 'Our AI uses advanced natural language processing and machine learning models trained on thousands of workflow patterns. It analyzes your description, identifies key entities, relationships, and requirements, then maps them to optimal workflow architectures. The AI continuously learns from successful implementations to improve suggestions.',
      category: 'ai',
      relatedQuestions: ['ai-accuracy', 'ai-learning', 'workflow-optimization']
    },
    {
      id: 'ai-accuracy',
      question: 'How accurate are the AI-generated workflows?',
      answer: 'Our AI achieves 95% accuracy in workflow generation, with most workflows requiring minimal manual adjustments. The AI validates connections, checks data compatibility, and predicts potential issues before deployment. It also provides confidence scores for each suggestion.',
      category: 'ai',
      relatedQuestions: ['ai-intelligence', 'error-handling', 'workflow-testing']
    },
    {
      id: 'workflow-optimization',
      question: 'Can the AI optimize existing workflows automatically?',
      answer: 'Yes! Our AI continuously monitors workflow performance and suggests optimizations in real-time. It can identify bottlenecks, recommend parallel processing opportunities, suggest better tool alternatives, and automatically adjust resource allocation based on usage patterns.',
      category: 'ai',
      relatedQuestions: ['ai-intelligence', 'performance-monitoring', 'auto-scaling']
    },
    {
      id: 'integration-complexity',
      question: 'How does AI handle complex integrations with legacy systems?',
      answer: 'Our AI specializes in bridging modern and legacy systems by automatically generating appropriate adapters, handling data format conversions, and managing authentication protocols. It can work with REST APIs, SOAP services, databases, file systems, and custom protocols.',
      category: 'integration',
      relatedQuestions: ['api-compatibility', 'data-transformation', 'security-protocols']
    },
    {
      id: 'error-handling',
      question: 'What happens when the AI-generated workflow encounters errors?',
      answer: 'Our AI implements predictive error handling with automatic retry logic, fallback mechanisms, and intelligent error recovery. It learns from failures to prevent similar issues and provides detailed diagnostics with suggested fixes.',
      category: 'technical',
      relatedQuestions: ['ai-accuracy', 'workflow-monitoring', 'debugging-assistance']
    },
    {
      id: 'ai-learning',
      question: 'Does the AI learn from my specific use cases?',
      answer: 'Absolutely! The AI creates organization-specific models that learn from your workflow patterns, preferences, and successful implementations. This personalized intelligence improves suggestions and reduces setup time for similar workflows.',
      category: 'ai',
      relatedQuestions: ['ai-intelligence', 'custom-models', 'workflow-templates']
    },
    {
      id: 'pricing-ai-usage',
      question: 'How is AI usage calculated in pricing tiers?',
      answer: 'AI operations include workflow generation, optimization suggestions, error predictions, and performance analysis. Each plan includes generous AI credits, and usage is transparently tracked in your dashboard with detailed breakdowns.',
      category: 'pricing',
      relatedQuestions: ['pricing-tiers', 'usage-monitoring', 'cost-optimization']
    },
    {
      id: 'data-security',
      question: 'How secure is my data when using AI features?',
      answer: 'All data is encrypted in transit and at rest. AI processing happens in isolated environments with zero data retention for model training unless explicitly opted in. We\'re SOC 2 compliant with enterprise-grade security controls.',
      category: 'technical',
      relatedQuestions: ['compliance-standards', 'data-privacy', 'enterprise-security']
    }
  ]

  const toggleFAQ = (faqId: string) => {
    if (openFAQ === faqId) {
      setOpenFAQ(null)
      setExpandedRelated([])
    } else {
      setOpenFAQ(faqId)
      // Auto-expand related questions
      const faq = faqs.find(f => f.id === faqId)
      if (faq) {
        setExpandedRelated(faq.relatedQuestions)
      }
    }
  }

  const getCategoryColor = (category: FAQ['category']) => {
    const colors = {
      ai: 'text-primary bg-primary/10 border-primary/20',
      technical: 'text-secondary bg-secondary/10 border-secondary/20',
      pricing: 'text-chart-3 bg-chart-3/10 border-chart-3/20',
      integration: 'text-chart-1 bg-chart-1/10 border-chart-1/20'
    }
    return colors[category]
  }

  const getCategoryLabel = (category: FAQ['category']) => {
    const labels = {
      ai: 'AI Intelligence',
      technical: 'Technical',
      pricing: 'Pricing',
      integration: 'Integration'
    }
    return labels[category]
  }

  const getRelatedFAQ = (id: string) => faqs.find(f => f.id === id)

  return (
    <section id="faq" className={`py-24 ${className}`}>
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
            <MessageSquare className="w-3 h-3 mr-1" />
            Smart FAQ
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get answers about our AI-powered workflow intelligence. 
            Questions expand to show related topics automatically.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card 
                className={`transition-all duration-300 cursor-pointer ${
                  openFAQ === faq.id 
                    ? 'border-primary/40 shadow-lg bg-card' 
                    : 'border-border bg-card/50 backdrop-blur-sm hover:border-primary/20'
                }`}
                onClick={() => toggleFAQ(faq.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCategoryColor(faq.category)}`}
                        >
                          {getCategoryLabel(faq.category)}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-1"
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-border/50 mt-4">
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {faq.answer}
                          </p>

                          {/* Related Questions */}
                          {faq.relatedQuestions.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  Related Questions
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                {faq.relatedQuestions.map((relatedId) => {
                                  const relatedFAQ = getRelatedFAQ(relatedId)
                                  if (!relatedFAQ) return null
                                  
                                  return (
                                    <motion.button
                                      key={relatedId}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3 }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFAQ(relatedId)
                                      }}
                                      className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200 group"
                                    >
                                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                      <span>{relatedFAQ.question}</span>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="bg-primary/5 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Still have questions?
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Our AI experts are here to help you understand how intelligent 
                workflows can transform your processes.
              </p>
              
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                <MessageSquare className="w-4 h-4 mr-2" />
                Talk to AI Expert
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
