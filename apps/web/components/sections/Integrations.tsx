"use client"

import * as React from "react"
import { Badge } from "@buzz8n/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@buzz8n/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@buzz8n/ui/components/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@buzz8n/ui/components/tooltip"

const integrations = {
  "AI Providers": [
    { name: "OpenAI", description: "GPT-4, GPT-3.5, DALL-E, Whisper", status: "Available" },
    { name: "Anthropic", description: "Claude 3.5 Sonnet, Claude 3 Haiku", status: "Available" },
    { name: "Ollama", description: "Local LLM deployment", status: "Available" },
    { name: "Google AI", description: "Gemini Pro, PaLM", status: "Coming Soon" },
  ],
  "Data & Storage": [
    { name: "Pinecone", description: "Vector database for embeddings", status: "Available" },
    { name: "PostgreSQL", description: "Relational database", status: "Available" },
    { name: "Supabase", description: "Backend as a service", status: "Available" },
    { name: "AWS S3", description: "Object storage", status: "Available" },
  ],
  "Communication": [
    { name: "Slack", description: "Team messaging and notifications", status: "Available" },
    { name: "Telegram", description: "Bot API and messaging", status: "Available" },
    { name: "Discord", description: "Community and bot integration", status: "Available" },
    { name: "Gmail", description: "Email automation", status: "Available" },
  ],
  "Productivity": [
    { name: "Notion", description: "Workspace and documentation", status: "Available" },
    { name: "HTTP/Webhooks", description: "Custom API integrations", status: "Available" },
    { name: "GitHub", description: "Code repository management", status: "Coming Soon" },
    { name: "Linear", description: "Issue tracking", status: "Coming Soon" },
  ],
}

export function Integrations() {
  const [activeTab, setActiveTab] = React.useState("AI Providers")

  return (
    <section id="integrations" className="py-20 md:py-28 bg-slate-950/50">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 mb-4">
            Integrations
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Connect with your favorite tools
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Pre-built integrations with popular AI providers, databases, communication tools, and productivity apps.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-900/50 border border-white/10">
            {Object.keys(integrations).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-cyan-400/10 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400/20"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(integrations).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((integration) => (
                  <TooltipProvider key={integration.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="bg-slate-900/50 border-white/10 hover:bg-slate-900/70 hover:border-white/20 transition-all duration-200 cursor-pointer group hover:scale-105">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-slate-100 text-sm font-medium">
                                {integration.name}
                              </CardTitle>
                              <Badge 
                                variant={integration.status === "Available" ? "default" : "secondary"}
                                className={
                                  integration.status === "Available" 
                                    ? "bg-green-400/10 text-green-400 border-green-400/20" 
                                    : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                                }
                              >
                                {integration.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-xs text-slate-400">
                              {integration.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-slate-400">{integration.description}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-slate-400">
            <span>Don't see your tool?</span>
            <a 
              href="/integrations/request" 
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Request an integration →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
