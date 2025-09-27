import { Workflow, Bot, Play } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@buzz8n/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@buzz8n/ui/components/tooltip"
import { Badge } from "@buzz8n/ui/components/badge"

const steps = [
  {
    step: "01",
    title: "Design flows",
    description: "Drag nodes and connect edges to build your agent workflow visually. No coding required.",
    icon: Workflow,
    codeHint: `{
  "trigger": "webhook",
  "agent": "gpt-4",
  "tools": ["search", "email"]
}`,
  },
  {
    step: "02", 
    title: "Add agents & tools",
    description: "Configure LLMs, memory systems, webhooks, and integrations like Telegram and Slack.",
    icon: Bot,
    codeHint: `{
  "model": "gpt-4-turbo",
  "memory": "vector-store",
  "tools": ["web-search", "slack-bot"]
}`,
  },
  {
    step: "03",
    title: "Run & observe", 
    description: "Execute workflows, view detailed logs, retry failed steps, and schedule recurring runs.",
    icon: Play,
    codeHint: `{
  "status": "running",
  "logs": [...],
  "schedule": "0 9 * * 1-5"
}`,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            How it works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Build workflows in three simple steps
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From concept to deployment in minutes. Our visual editor makes complex agent orchestration accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={step.step} className="bg-slate-900/50 border-white/10 hover:bg-slate-900/70 transition-colors group">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-400/10 border border-cyan-400/20 group-hover:bg-cyan-400/20 transition-colors">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-500">{step.step}</div>
                  </div>
                  <CardTitle className="text-slate-100">{step.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-slate-950/50 border border-white/5 rounded-lg p-3 font-mono text-xs text-slate-400 cursor-help hover:border-white/10 transition-colors">
                          <div className="text-cyan-400 mb-1">// Example config</div>
                          <pre className="whitespace-pre-wrap">{step.codeHint}</pre>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Example configuration for this step</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Connection lines for desktop */}
        <div className="hidden md:block relative -mt-64 mb-64 pointer-events-none">
          <svg className="absolute inset-0 w-full h-32">
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="rgb(148 163 184 / 0.3)"
                />
              </marker>
            </defs>
            <path
              d="M 33% 50% L 67% 50%"
              stroke="rgb(148 163 184 / 0.3)"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
              strokeDasharray="5,5"
            />
            <path
              d="M 67% 50% L 100% 50%"
              stroke="rgb(148 163 184 / 0.3)"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
