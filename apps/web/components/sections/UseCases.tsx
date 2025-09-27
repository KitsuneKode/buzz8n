import { 
  Headphones, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Database, 
  Bell 
} from "lucide-react"

import { Badge } from "@buzz8n/ui/components/badge"

const useCases = [
  {
    title: "Support Automation",
    description: "Route tickets, generate responses, and escalate complex issues automatically.",
    icon: Headphones,
    tags: ["Customer Service", "AI Support"],
  },
  {
    title: "Lead Enrichment", 
    description: "Research prospects, validate contact info, and personalize outreach at scale.",
    icon: TrendingUp,
    tags: ["Sales", "CRM Integration"],
  },
  {
    title: "Content Operations",
    description: "Generate, review, and publish content across multiple channels and formats.",
    icon: FileText,
    tags: ["Marketing", "Content Management"],
  },
  {
    title: "L2 Triage",
    description: "Analyze incidents, gather context, and route to appropriate engineering teams.",
    icon: AlertTriangle,
    tags: ["DevOps", "Incident Response"],
  },
  {
    title: "ETL to Vector DB",
    description: "Extract, transform, and load data into vector databases for RAG applications.",
    icon: Database,
    tags: ["Data Engineering", "RAG"],
  },
  {
    title: "Alerting & Notifications",
    description: "Monitor systems, detect anomalies, and send intelligent alerts via multiple channels.",
    icon: Bell,
    tags: ["Monitoring", "Operations"],
  },
]

export function UseCases() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            Use cases
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Built for real-world automation
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From customer support to data engineering, teams use Buzz8n to automate complex workflows across every department.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <div 
                key={useCase.title}
                className="group p-6 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/50 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-400/10 border border-cyan-400/20 group-hover:bg-cyan-400/20 transition-colors flex-shrink-0">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.tags.map((tag) => (
                        <Badge 
                          key={tag}
                          variant="secondary"
                          className="bg-white/5 text-slate-300 border-white/10 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-400">
            <span>Need a custom use case?</span>
            <a 
              href="/contact" 
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Let's talk →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
