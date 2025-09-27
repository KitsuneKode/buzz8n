'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@buzz8n/ui/components/card'
import { Badge } from '@buzz8n/ui/components/badge'
import { Button } from '@buzz8n/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@buzz8n/ui/components/tabs'
import { AnimatedCounter } from '../shared/AnimatedCounter'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Brain,
  User,
  Bot
} from 'lucide-react'

interface Comparison {
  id: string
  title: string
  manual: {
    time: string
    accuracy: string
    errors: number
    complexity: 'Low' | 'Medium' | 'High'
    steps: string[]
  }
  ai: {
    time: string
    accuracy: string
    errors: number
    complexity: 'Low' | 'Medium' | 'High'
    steps: string[]
  }
}

interface IntelligenceShowcaseProps {
  className?: string
}

export function IntelligenceShowcase({ className = '' }: IntelligenceShowcaseProps) {
  const [activeComparison, setActiveComparison] = useState('workflow-creation')

  const comparisons: Comparison[] = [
    {
      id: 'workflow-creation',
      title: 'Workflow Creation',
      manual: {
        time: '4-6 hours',
        accuracy: '75%',
        errors: 12,
        complexity: 'High',
        steps: [
          'Research available tools and APIs',
          'Design workflow architecture',
          'Configure individual nodes manually',
          'Test connections and data flow',
          'Debug integration issues',
          'Optimize performance manually'
        ]
      },
      ai: {
        time: '15 minutes',
        accuracy: '95%',
        errors: 1,
        complexity: 'Low',
        steps: [
          'Describe workflow in natural language',
          'AI suggests optimal architecture',
          'Auto-configure nodes and connections',
          'AI validates and optimizes flow',
          'Deploy with built-in monitoring'
        ]
      }
    },
    {
      id: 'error-handling',
      title: 'Error Handling & Debugging',
      manual: {
        time: '2-3 hours',
        accuracy: '60%',
        errors: 8,
        complexity: 'High',
        steps: [
          'Manually identify failure points',
          'Add try-catch blocks',
          'Configure retry logic',
          'Set up logging and monitoring',
          'Test edge cases manually'
        ]
      },
      ai: {
        time: '5 minutes',
        accuracy: '92%',
        errors: 0,
        complexity: 'Low',
        steps: [
          'AI predicts potential failure points',
          'Auto-implement robust error handling',
          'Smart retry with exponential backoff',
          'Integrated monitoring and alerts'
        ]
      }
    },
    {
      id: 'optimization',
      title: 'Performance Optimization',
      manual: {
        time: '3-4 hours',
        accuracy: '70%',
        errors: 5,
        complexity: 'High',
        steps: [
          'Analyze performance bottlenecks',
          'Manually adjust configurations',
          'Test different approaches',
          'Monitor and iterate',
          'Document optimizations'
        ]
      },
      ai: {
        time: 'Real-time',
        accuracy: '88%',
        errors: 0,
        complexity: 'Low',
        steps: [
          'Continuous performance monitoring',
          'AI identifies optimization opportunities',
          'Auto-adjust resource allocation',
          'Dynamic load balancing'
        ]
      }
    }
  ]

  const metrics = [
    { label: 'Time Saved', value: 85, suffix: '%', icon: <Clock className="w-4 h-4" /> },
    { label: 'Accuracy Improved', value: 40, suffix: '%', icon: <Target className="w-4 h-4" /> },
    { label: 'Errors Reduced', value: 92, suffix: '%', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Faster Deployment', value: 10, suffix: 'x', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  // Get current comparison for potential future use
  // const currentComparison = comparisons.find(c => c.id === activeComparison)!

  return (
    <section id="showcase" className={`py-24 ${className}`}>
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
            <Brain className="w-3 h-3 mr-1" />
            Intelligence Showcase
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Before vs After AI
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See the dramatic difference AI makes in workflow creation, debugging, 
            and optimization. Real metrics from real workflows.
          </p>
        </motion.div>

        {/* Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {metrics.map((metric, index) => (
            <Card key={metric.label} className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4"
                >
                  <div className="text-primary">
                    {metric.icon}
                  </div>
                </motion.div>
                
                <div className="text-2xl font-bold text-foreground mb-1">
                  <AnimatedCounter 
                    end={metric.value} 
                    suffix={metric.suffix}
                    trigger={true}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Comparison Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Tabs value={activeComparison} onValueChange={setActiveComparison} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {comparisons.map((comparison) => (
                <TabsTrigger 
                  key={comparison.id} 
                  value={comparison.id}
                  className="text-sm"
                >
                  {comparison.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {comparisons.map((comparison) => (
              <TabsContent key={comparison.id} value={comparison.id}>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Manual Process */}
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-muted rounded-lg">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Manual Process
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Traditional workflow creation
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-foreground">
                            {comparison.manual.time}
                          </div>
                          <div className="text-xs text-muted-foreground">Time Required</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-foreground">
                            {comparison.manual.accuracy}
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">
                            {comparison.manual.errors} typical errors
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {comparison.manual.complexity} Complexity
                        </Badge>
                      </div>

                      {/* Steps */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Process Steps:</h4>
                        {comparison.manual.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-muted-foreground flex-1">
                              {step}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI-Powered Process */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            AI-Powered Process
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Intelligent automation
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <div className="text-lg font-bold text-primary">
                            {comparison.ai.time}
                          </div>
                          <div className="text-xs text-muted-foreground">Time Required</div>
                        </div>
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <div className="text-lg font-bold text-primary">
                            {comparison.ai.accuracy}
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {comparison.ai.errors} typical errors
                          </span>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          {comparison.ai.complexity} Complexity
                        </Badge>
                      </div>

                      {/* Steps */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">AI Process Steps:</h4>
                        {comparison.ai.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            viewport={{ once: true }}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-muted-foreground flex-1">
                              {step}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground group"
          >
            <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Experience AI Intelligence
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
