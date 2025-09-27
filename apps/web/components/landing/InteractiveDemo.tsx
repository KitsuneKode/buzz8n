'use client'

import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Code,
  Database,
  Globe,
  MessageSquare,
  Zap,
  CheckCircle,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@buzz8n/ui/components/tooltip'
import { Card, CardContent } from '@buzz8n/ui/components/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState, useEffect } from 'react'

interface DemoStep {
  id: string
  title: string
  description: string
  code: string
  aiSuggestion: string
  duration: number
}

interface InteractiveDemoProps {
  className?: string
}

export function InteractiveDemo({ className = '' }: InteractiveDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  const demoSteps: DemoStep[] = [
    {
      id: 'input',
      title: 'Data Input Node',
      description: 'AI detects data structure and suggests optimal processing',
      code: '{\n  "type": "data_input",\n  "source": "api_endpoint",\n  "format": "json"\n}',
      aiSuggestion: 'Detected JSON structure. Recommending data validation node.',
      duration: 2000,
    },
    {
      id: 'process',
      title: 'AI Processing',
      description: 'LLM analyzes content and extracts insights',
      code: '{\n  "type": "llm_processor",\n  "model": "gpt-4",\n  "task": "sentiment_analysis"\n}',
      aiSuggestion: 'Optimal model selected based on data type and task complexity.',
      duration: 2500,
    },
    {
      id: 'transform',
      title: 'Data Transform',
      description: 'Smart transformation based on downstream requirements',
      code: '{\n  "type": "transformer",\n  "operation": "normalize",\n  "output_format": "structured"\n}',
      aiSuggestion: 'Auto-configured transformation to match API requirements.',
      duration: 2000,
    },
    {
      id: 'output',
      title: 'Intelligent Output',
      description: 'AI optimizes delivery format and routing',
      code: '{\n  "type": "output_handler",\n  "destination": "webhook",\n  "format": "optimized"\n}',
      aiSuggestion: 'Workflow complete! Performance optimized by 40%.',
      duration: 2000,
    },
  ]

  const typeText = (text: string, callback?: () => void) => {
    setTypedText('')
    let index = 0
    const interval = setInterval(() => {
      setTypedText(text.slice(0, index + 1))
      index++
      if (index >= text.length) {
        clearInterval(interval)
        callback?.()
      }
    }, 30)
    return interval
  }

  useEffect(() => {
    if (!isPlaying) return

    const step = demoSteps[currentStep]
    const typeInterval = typeText(step?.code || '', () => {
      setTimeout(() => setShowAISuggestion(true), 500)
    })

    const stepTimeout = setTimeout(() => {
      setShowAISuggestion(false)
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        setCurrentStep(0)
      }
    }, step?.duration)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(stepTimeout)
    }
  }, [isPlaying, currentStep, demoSteps])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      setShowAISuggestion(false)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setTypedText('')
    setShowAISuggestion(false)
  }

  const nodeIcons = {
    input: <Database className="w-4 h-4" />,
    process: <MessageSquare className="w-4 h-4" />,
    transform: <Code className="w-4 h-4" />,
    output: <Globe className="w-4 h-4" />,
  }

  return (
    <section id="demo" className={`py-24 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Play className="w-3 h-3 mr-1" />
            Interactive Demo
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Watch AI Build Your Workflow
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            See how our AI understands your requirements and automatically creates optimized
            workflows with intelligent suggestions at every step.
          </p>

          {/* Demo Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Demo
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!isPlaying && currentStep === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Workflow Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Workflow Builder</h3>

                  <div className="space-y-4">
                    {demoSteps.map((step, index) => (
                      <TooltipProvider key={step.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                                index === currentStep && isPlaying
                                  ? 'bg-primary/10 border border-primary/20'
                                  : index < currentStep || (!isPlaying && index <= currentStep)
                                    ? 'bg-muted/50 border border-border'
                                    : 'bg-background/50 border border-border/50'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                className={`p-2 rounded-md ${
                                  index === currentStep && isPlaying
                                    ? 'bg-primary text-primary-foreground'
                                    : index < currentStep || (!isPlaying && index <= currentStep)
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {nodeIcons[step.id as keyof typeof nodeIcons]}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-foreground">{step.title}</span>
                                  {index < currentStep && (
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                  )}
                                  {index === currentStep && isPlaying && (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                      <Zap className="w-4 h-4 text-primary" />
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>

                              {index < demoSteps.length - 1 && (
                                <div className="w-px h-8 bg-border absolute left-8 mt-12" />
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{step.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Code Editor */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-0">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-destructive rounded-full" />
                        <div className="w-3 h-3 bg-chart-3 rounded-full" />
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      </div>
                      <span className="text-sm font-medium text-foreground ml-4">
                        {demoSteps[currentStep]?.title || 'Workflow Node'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Auto-generated
                    </Badge>
                  </div>

                  {/* Code Content */}
                  <div className="p-4 bg-background/50 font-mono text-sm">
                    <pre className="text-foreground whitespace-pre-wrap min-h-[120px]">
                      {typedText}
                      {isPlaying && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-primary"
                        >
                          |
                        </motion.span>
                      )}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestion Panel */}
              <AnimatePresence>
                {showAISuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground mb-1">AI Insight</h4>
                            <p className="text-sm text-muted-foreground">
                              {demoSteps[currentStep]?.aiSuggestion}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
