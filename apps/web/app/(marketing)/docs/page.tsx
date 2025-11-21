import { Zap, BookOpen, Puzzle, GraduationCap } from 'lucide-react'
import { LinkCard } from '@/components/docs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buzz8n Documentation | Learn to Build Automated Workflows',
  description:
    'Complete guide to building automated workflows with Buzz8n. Learn about nodes, integrations, and create your first workflow.',
}

export default function DocsHomePage() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Buzz8n Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Learn how to build powerful automated workflows with no-code visual programming.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/getting-started"
            title="Introduction"
            description="Learn what Buzz8n is and what you can build with it"
          />
          <LinkCard
            href="/docs/getting-started/your-first-workflow"
            title="Your First Workflow"
            description="Create your first workflow in 5 minutes"
          />
          <LinkCard
            href="/docs/getting-started/understanding-nodes"
            title="Understanding Nodes"
            description="Learn about the building blocks of workflows"
          />
          <LinkCard
            href="/docs/getting-started/connecting-nodes"
            title="Connecting Nodes"
            description="Connect nodes to create powerful automations"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nodes</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Explore all available nodes and learn how to use them in your workflows.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs/nodes/manual-trigger" className="text-primary hover:underline">
                  Manual Trigger
                </a>
              </li>
              <li>
                <a href="/docs/nodes/webhook" className="text-primary hover:underline">
                  Webhook
                </a>
              </li>
              <li>
                <a href="/docs/nodes/telegram" className="text-primary hover:underline">
                  Telegram
                </a>
              </li>
              <li>
                <a href="/docs/nodes/ai-agent" className="text-primary hover:underline">
                  AI Agent
                </a>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Integrations</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Set up credentials to connect Buzz8n with external services.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs/credentials/telegram" className="text-primary hover:underline">
                  Telegram Bot Setup
                </a>
              </li>
              <li>
                <a href="/docs/credentials/email" className="text-primary hover:underline">
                  Email (Resend)
                </a>
              </li>
              <li>
                <a href="/docs/credentials/openai" className="text-primary hover:underline">
                  OpenAI
                </a>
              </li>
              <li>
                <a href="/docs/credentials/gemini" className="text-primary hover:underline">
                  Google Gemini
                </a>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Tutorials</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Follow step-by-step guides to build real-world workflows.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs/tutorials/telegram-bot" className="text-primary hover:underline">
                  Build a Telegram Bot
                </a>
              </li>
              <li>
                <a href="/docs/tutorials/email-automation" className="text-primary hover:underline">
                  Email Automation
                </a>
              </li>
              <li>
                <a href="/docs/tutorials/ai-chatbot" className="text-primary hover:underline">
                  AI Chatbot
                </a>
              </li>
              <li>
                <a href="/docs/tutorials/webhook-listener" className="text-primary hover:underline">
                  Webhook Listener
                </a>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">Resources</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Additional resources to help you get the most out of Buzz8n.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs/resources/changelog" className="text-primary hover:underline">
                  Changelog
                </a>
              </li>
              <li>
                <a href="/docs/resources/roadmap" className="text-primary hover:underline">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="/docs/resources/faq" className="text-primary hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/docs/troubleshooting" className="text-primary hover:underline">
                  Troubleshooting
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-muted/50 rounded-lg p-8 border">
          <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? Check out our troubleshooting guide or
            FAQ.
          </p>
          <div className="flex gap-3">
            <a
              href="/docs/troubleshooting"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Troubleshooting
            </a>
            <a
              href="/docs/resources/faq"
              className="inline-flex items-center justify-center px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
