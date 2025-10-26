'use client'

import {
  Play,
  RotateCcw,
  Code,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Info,
  Bug,
  Copy,
  Trash2,
  Bot,
  Mail,
  Webhook,
  Loader2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@buzz8n/ui/components/tooltip'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { Card, CardContent } from '@buzz8n/ui/components/card'
import { IconBrandTelegram } from '@tabler/icons-react'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { motion } from 'framer-motion'

// Real node types from the actual system
type NodeType = 'manualTrigger' | 'aiAgent' | 'telegramSendMessage' | 'emailSend' | 'webhook'
type ExecutionStatus = 'initial' | 'loading' | 'success' | 'error'

interface DemoNode {
  id: string
  type: NodeType
  label: string
  description: string
  status: ExecutionStatus
  config: Record<string, unknown>
  logs: ExecutionLog[]
  startTime?: number
  endTime?: number
  duration?: number
}

interface ExecutionLog {
  id: string
  timestamp: Date
  nodeId: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: Record<string, unknown>
  status: ExecutionStatus
}

interface InteractiveDemoProps {
  className?: string
}

export function InteractiveDemo({ className = '' }: InteractiveDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentExecution, setCurrentExecution] = useState<DemoNode[]>([])
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hasAutoRun, setHasAutoRun] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Real workflow nodes based on actual system
  const workflowNodes: DemoNode[] = useMemo(
    () => [
      {
        id: 'trigger-1',
        type: 'manualTrigger',
        label: 'Manual Trigger',
        description: 'Starts the workflow execution',
        status: 'initial',
        config: {},
        logs: [],
      },
      {
        id: 'ai-1',
        type: 'aiAgent',
        label: 'AI Content Analyzer',
        description: 'Analyzes incoming data with AI',
        status: 'initial',
        config: {
          prompt: 'Analyze the sentiment and extract key insights from the provided text',
          model: 'gemini-2.5-flash',
        },
        logs: [],
      },
      {
        id: 'telegram-1',
        type: 'telegramSendMessage',
        label: 'Send Telegram Alert',
        description: 'Sends notification via Telegram',
        status: 'initial',
        config: {
          chatId: '@alerts_channel',
          message: 'AI analysis complete: {{ai-1.output.summary}}',
        },
        logs: [],
      },
      {
        id: 'email-1',
        type: 'emailSend',
        label: 'Send Email Report',
        description: 'Sends detailed report via email',
        status: 'initial',
        config: {
          to: 'admin@company.com',
          subject: 'Daily AI Analysis Report',
          body: 'Detailed analysis results: {{ai-1.output.details}}',
        },
        logs: [],
      },
    ],
    [],
  )

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'manualTrigger':
        return <Play className="w-4 h-4" />
      case 'aiAgent':
        return <Bot className="w-4 h-4" />
      case 'telegramSendMessage':
        return <IconBrandTelegram className="w-4 h-4" />
      case 'emailSend':
        return <Mail className="w-4 h-4" />
      case 'webhook':
        return <Webhook className="w-4 h-4" />
      default:
        return <Code className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'initial':
        return 'bg-muted text-muted-foreground'
      case 'loading':
        return 'bg-blue-500 text-white'
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getLogIcon = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const simulateExecution = useCallback(async () => {
    const nodes = [...workflowNodes]
    const logs: ExecutionLog[] = []

    // Reset all nodes
    nodes.forEach((node) => {
      node.status = 'initial'
      node.logs = []
      node.startTime = undefined
      node.endTime = undefined
      node.duration = undefined
    })

    setCurrentExecution(nodes)
    setExecutionLogs([])

    // Add initial workflow start log
    const workflowStartLog: ExecutionLog = {
      id: 'workflow-start',
      timestamp: new Date(),
      nodeId: 'workflow',
      level: 'info',
      message: '🚀 Workflow execution started',
      status: 'loading',
    }
    logs.push(workflowStartLog)
    setExecutionLogs([...logs])

    // Brief pause before starting nodes
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node) continue

      // Start node execution
      node.status = 'loading'
      node.startTime = Date.now()

      const startLog: ExecutionLog = {
        id: `log-${node.id}-start`,
        timestamp: new Date(),
        nodeId: node.id,
        level: 'info',
        message: `⚡ Starting execution of ${node.label}`,
        status: 'loading',
      }

      logs.push(startLog)
      node.logs.push(startLog)

      setCurrentExecution([...nodes])
      setExecutionLogs([...logs])

      // Simulate processing time with more realistic variation
      const processingTime = 1200 + Math.random() * 1800
      await new Promise((resolve) => setTimeout(resolve, processingTime))

      // Complete node execution
      node.status = 'success'
      node.endTime = Date.now()
      node.duration = node.endTime - node.startTime!

      const successLog: ExecutionLog = {
        id: `log-${node.id}-success`,
        timestamp: new Date(),
        nodeId: node.id,
        level: 'info',
        message: `✅ ${node.label} completed successfully in ${node.duration}ms`,
        status: 'success',
        data: {
          output: generateMockOutput(node.type),
          duration: node.duration,
        },
      }

      logs.push(successLog)
      node.logs.push(successLog)

      setCurrentExecution([...nodes])
      setExecutionLogs([...logs])

      // Brief pause between nodes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Add workflow completion log
    const workflowCompleteLog: ExecutionLog = {
      id: 'workflow-complete',
      timestamp: new Date(),
      nodeId: 'workflow',
      level: 'info',
      message: '🎉 Workflow execution completed successfully!',
      status: 'success',
    }
    logs.push(workflowCompleteLog)
    setExecutionLogs([...logs])

    // Auto-reset after completion
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }, [workflowNodes])

  // Intersection Observer for auto-run
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting && !hasAutoRun && !isPlaying) {
          setHasAutoRun(true)
          setTimeout(() => {
            setIsPlaying(true)
            simulateExecution()
          }, 1000) // Delay to let user see the component first
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAutoRun, isPlaying, simulateExecution])

  const generateMockOutput = (type: NodeType) => {
    switch (type) {
      case 'manualTrigger':
        return { triggered: true, timestamp: new Date().toISOString() }
      case 'aiAgent':
        return {
          summary: 'Positive sentiment detected with 85% confidence',
          details:
            'The analyzed text shows strong positive sentiment with key themes around innovation and growth.',
          confidence: 0.85,
          themes: ['innovation', 'growth', 'technology'],
        }
      case 'telegramSendMessage':
        return { messageId: '12345', sent: true, timestamp: new Date().toISOString() }
      case 'emailSend':
        return { messageId: 'msg_67890', delivered: true, timestamp: new Date().toISOString() }
      default:
        return { completed: true }
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      simulateExecution()
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentExecution([])
    setExecutionLogs([])
    setSelectedNodeId(null)
    setHasAutoRun(false) // Allow auto-run again
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  return (
    <section
      ref={sectionRef}
      id="demo"
      className={`py-24 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 mb-4 px-4 py-2"
            >
              <motion.div
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
              >
                <Play className="w-3 h-3 mr-1" />
              </motion.div>
              Live Workflow Execution
            </Badge>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            See Your Workflow in Action
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Watch a real workflow execution with AI-powered nodes, live logs, and detailed execution
            tracking. Experience the power of intelligent automation.
          </motion.p>

          {/* Demo Controls */}
          <motion.div
            className="flex items-center justify-center space-x-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={handlePlayPause}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Execution
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isPlaying}
              className="hover:bg-muted/50 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Workflow Nodes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <motion.div
                        animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                      >
                        <Code className="w-5 h-5 mr-2 text-primary" />
                      </motion.div>
                      Workflow Nodes
                    </h3>
                    <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                      {currentExecution.filter((n) => n.status === 'success').length}/
                      {workflowNodes.length} Complete
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {workflowNodes.map((node, index) => (
                      <TooltipProvider key={node.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 cursor-pointer border-2 shadow-lg hover:shadow-xl ${
                                node.status === 'loading'
                                  ? 'bg-primary/10 border-primary/30 shadow-primary/20'
                                  : node.status === 'success'
                                    ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20'
                                    : 'bg-background/60 border-border/50 hover:border-border'
                              }`}
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() =>
                                setSelectedNodeId(selectedNodeId === node.id ? null : node.id)
                              }
                              animate={
                                node.status === 'loading'
                                  ? {
                                      boxShadow: [
                                        '0 0 0 0 rgba(59, 130, 246, 0.4)',
                                        '0 0 0 10px rgba(59, 130, 246, 0)',
                                        '0 0 0 0 rgba(59, 130, 246, 0)',
                                      ],
                                    }
                                  : {}
                              }
                              transition={{
                                duration: 1.5,
                                repeat: node.status === 'loading' ? Infinity : 0,
                              }}
                            >
                              <motion.div
                                className={`p-3 rounded-lg ${getStatusColor(node.status)} shadow-md`}
                                animate={
                                  node.status === 'loading'
                                    ? {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 2,
                                  repeat: node.status === 'loading' ? Infinity : 0,
                                }}
                              >
                                {getNodeIcon(node.type)}
                              </motion.div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-foreground">{node.label}</span>
                                  {node.status === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                  {node.status === 'loading' && (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                      <Zap className="w-4 h-4 text-blue-500" />
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{node.description}</p>
                                {node.duration && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Completed in {node.duration}ms
                                  </p>
                                )}
                              </div>

                              {index < workflowNodes.length - 1 && (
                                <div className="w-px h-8 bg-border absolute left-8 mt-12" />
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{node.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Execution Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border h-[600px] shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Logs Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-3 h-3 bg-destructive rounded-full"
                          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                        />
                        <motion.div
                          className="w-3 h-3 bg-chart-3 rounded-full"
                          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-3 h-3 bg-primary rounded-full"
                          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground ml-4 flex items-center">
                        <motion.div
                          animate={isPlaying ? { rotate: 360 } : {}}
                          transition={{
                            duration: 2,
                            repeat: isPlaying ? Infinity : 0,
                            ease: 'linear',
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                        </motion.div>
                        Execution Logs
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {executionLogs.length} entries
                      </Badge>
                      <Button variant="outline" size="sm" disabled={executionLogs.length === 0}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" disabled={executionLogs.length === 0}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Logs Content */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        {executionLogs.length === 0 ? (
                          <motion.div
                            className="text-center text-muted-foreground py-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Clock className="w-12 h-12 mx-auto mb-4 opacity-60" />
                            </motion.div>
                            <p className="text-lg font-medium mb-2">Ready to Execute</p>
                            <p className="text-sm opacity-75">
                              Start the workflow to see live execution logs
                            </p>
                          </motion.div>
                        ) : (
                          executionLogs.map((log) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.4 }}
                              className={`flex items-start space-x-3 p-4 rounded-xl border-l-4 shadow-md hover:shadow-lg transition-all duration-300 ${
                                log.level === 'info'
                                  ? 'border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
                                  : log.level === 'warn'
                                    ? 'border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10'
                                    : log.level === 'error'
                                      ? 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10'
                                      : 'border-l-gray-500 bg-gray-500/5 hover:bg-gray-500/10'
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.level)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {log.message}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {log.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{formatTime(log.timestamp)}</span>
                                  <span>Node: {log.nodeId}</span>
                                  {log.data &&
                                    'duration' in log.data &&
                                    typeof log.data.duration === 'number' && (
                                      <span>Duration: {log.data.duration}ms</span>
                                    )}
                                </div>
                                {log.data && 'output' in log.data && (
                                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                                    <pre className="whitespace-pre-wrap text-muted-foreground">
                                      {JSON.stringify(log.data.output, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
