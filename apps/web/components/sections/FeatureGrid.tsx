import { 
  Workflow, 
  Users, 
  Shield, 
  BarChart3, 
  Clock, 
  GitBranch,
  ChevronRight
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@buzz8n/ui/components/card"
import { Button } from "@buzz8n/ui/components/button"
import { Separator } from "@buzz8n/ui/components/separator"

const features = [
  {
    title: "Visual Editor",
    description: "Drag-and-drop interface for building complex agent workflows without writing code.",
    icon: Workflow,
    href: "/docs/editor",
  },
  {
    title: "Multi-agent Orchestration", 
    description: "Coordinate multiple AI agents working together on complex tasks with shared context.",
    icon: Users,
    href: "/docs/agents",
  },
  {
    title: "Credential Vault",
    description: "Securely store and manage API keys, tokens, and sensitive configuration data.",
    icon: Shield,
    href: "/docs/security",
  },
  {
    title: "Observability & Logs",
    description: "Real-time monitoring, detailed execution logs, and performance analytics for all workflows.",
    icon: BarChart3,
    href: "/docs/monitoring",
  },
  {
    title: "Schedules & Webhooks",
    description: "Trigger workflows on schedules, webhooks, or external events with flexible routing.",
    icon: Clock,
    href: "/docs/triggers",
  },
  {
    title: "Versioning & Environments",
    description: "Manage workflow versions, deploy to different environments, and rollback changes safely.",
    icon: GitBranch,
    href: "/docs/deployment",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-950/50">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Everything you need to build agent workflows
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Production-ready features for teams building sophisticated AI automation at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card 
                key={feature.title} 
                className="bg-slate-900/50 border-white/10 hover:bg-slate-900/70 hover:border-white/20 transition-all duration-200 group"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 group-hover:bg-cyan-400/20 transition-colors">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                  </div>
                  <CardTitle className="text-slate-100 text-lg">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <Separator className="bg-white/5" />
                
                <CardContent className="pt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 p-0 h-auto font-medium group/button"
                    asChild
                  >
                    <a href={feature.href}>
                      Learn more
                      <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/button:translate-x-0.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold"
          >
            Explore all features
          </Button>
        </div>
      </div>
    </section>
  )
}
