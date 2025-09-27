'use client'

import { Sparkles, Play, ArrowRight, Zap, Brain, Dog } from 'lucide-react'
import { ReactFlowNodeGraph } from '../shared/ReactFlowNodeGraph'
import { Button } from '@buzz8n/ui/components/button'
import { motion, type Variants } from 'framer-motion'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface IntelligentHeroProps {
  className?: string
}

export function IntelligentHero({ className = '' }: IntelligentHeroProps) {
  const [timeOfDay, setTimeOfDay] = useState('')
  const [currentDemo, setCurrentDemo] = useState(0)

  const demoTexts = [
    'Building intelligent workflows...',
    'AI optimizing connections...',
    'Smart suggestions ready...',
    'Workflow intelligence active...',
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')

    // Cycle through demo texts
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoTexts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [demoTexts.length])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
      case 'afternoon':
        return "Good afternoon! Let's create something amazing."
      case 'evening':
        return 'Good evening! Time to innovate.'
      default:
        return 'Ready to build intelligent workflows?'
    }
  }

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.7214_0.1337_49.9802/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.594_0.0443_196.0233/0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Workflow Builder
                </Badge>

                <motion.p
                  className="text-sm text-muted-foreground font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {getGreeting()}
                </motion.p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  AI-Powered
                  <br />
                  <span className="text-primary">Workflow Intelligence</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Connect LLMs, agents, and tools in a visual canvas. Let AI optimize your processes
                  automatically with intelligent suggestions and real-time optimization.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link href="/signin">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Dog className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border hover:bg-accent hover:text-accent-foreground group transition-all duration-200"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Sign Up to Demo
                  </Button>
                </Link>
              </motion.div>

              {/* AI Demo Status */}
              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-3 text-sm text-muted-foreground"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-mono">{demoTexts[currentDemo]}</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Interactive Node Graph */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="w-3 h-3 bg-destructive rounded-full" />
                  <div className="w-3 h-3 bg-chart-3 rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>

                <div className="mt-8">
                  <ReactFlowNodeGraph
                    animated={true}
                    interactive={true}
                    showControls={true}
                    height="280px"
                    className="w-full"
                  />
                </div>

                {/* AI Insights Panel */}
                <motion.div
                  className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">AI Insights</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detected optimization opportunity: Parallel processing can reduce execution time
                    by 40%
                  </p>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full p-3"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Brain className="w-6 h-6 text-primary" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-secondary/10 backdrop-blur-sm border border-secondary/20 rounded-full p-3"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                <Sparkles className="w-6 h-6 text-secondary" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
