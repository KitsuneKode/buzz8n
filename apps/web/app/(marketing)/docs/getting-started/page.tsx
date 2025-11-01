import { Workflow, Zap, Puzzle, Play } from 'lucide-react'
import { Callout, LinkCard } from '@/components/docs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Introduction to Buzz8n | Getting Started',
  description: 'Learn what Buzz8n is and how you can use it to automate your workflows.',
}

export default function GettingStartedPage() {
  return (
    <div>
      <header className="mb-8">
        <h1>Introduction to Buzz8n</h1>
        <p className="lead">
          Buzz8n is a visual workflow automation platform that lets you connect apps, services, and
          APIs without writing code.
        </p>
      </header>

      <Callout type="tip" title="New to workflow automation?">
        Don&apos;t worry! This guide will walk you through everything you need to know. Start with{' '}
        <a href="/docs/getting-started/your-first-workflow" className="underline">
          Your First Workflow
        </a>{' '}
        to get hands-on experience.
      </Callout>

      <section>
        <h2>What is Buzz8n?</h2>
        <p>
          Buzz8n is a no-code automation platform that helps you connect different services and
          automate repetitive tasks. Think of it as a digital assistant that can:
        </p>
        <ul>
          <li>Send notifications to Telegram when something happens</li>
          <li>Process incoming webhooks from other services</li>
          <li>Use AI to analyze and respond to data</li>
          <li>Send automated emails based on triggers</li>
          <li>And much more!</li>
        </ul>
      </section>

      <section>
        <h2>Key Concepts</h2>
        <div className="grid gap-6 my-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold m-0">Workflows</h3>
            </div>
            <p className="m-0">
              A workflow is a series of automated actions. It&apos;s like a recipe that tells Buzz8n
              what to do step by step. Every workflow starts with a trigger and can have multiple
              actions.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Puzzle className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold m-0">Nodes</h3>
            </div>
            <p className="m-0">
              Nodes are the building blocks of workflows. Each node represents a single action or
              trigger. You connect nodes together to create your automation flow.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold m-0">Triggers</h3>
            </div>
            <p className="m-0">
              Triggers are special nodes that start your workflow. They can be manual (you click a
              button) or automatic (a webhook receives data). Every workflow needs at least one
              trigger.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Play className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold m-0">Credentials</h3>
            </div>
            <p className="m-0">
              Credentials are saved connections to external services like Telegram, OpenAI, or email
              providers. You set them up once and can reuse them across multiple workflows.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>Creating a workflow in Buzz8n is simple:</p>
        <ol>
          <li>
            <strong>Choose a trigger</strong> - Decide what starts your workflow (manual button,
            webhook, etc.)
          </li>
          <li>
            <strong>Add actions</strong> - Connect nodes that perform tasks (send message, call API,
            use AI)
          </li>
          <li>
            <strong>Configure each node</strong> - Fill in the details for each action
          </li>
          <li>
            <strong>Test your workflow</strong> - Run it to make sure everything works
          </li>
          <li>
            <strong>Activate it</strong> - Turn it on to run automatically
          </li>
        </ol>
      </section>

      <section>
        <h2>What Can You Build?</h2>
        <p>Here are some examples of workflows you can create with Buzz8n:</p>
        <ul>
          <li>
            <strong>Notification Bot:</strong> Get Telegram notifications when your website receives
            a form submission
          </li>
          <li>
            <strong>AI Assistant:</strong> Use AI to analyze customer messages and send automated
            responses
          </li>
          <li>
            <strong>Email Automation:</strong> Send welcome emails to new users automatically
          </li>
          <li>
            <strong>Webhook Handler:</strong> Process webhooks from GitHub, Stripe, or other
            services
          </li>
          <li>
            <strong>Data Processing:</strong> Collect data from APIs and process it with AI
          </li>
        </ul>
      </section>

      <Callout type="success">Ready to build your first workflow? Let&apos;s get started!</Callout>

      <section>
        <h2>Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/getting-started/your-first-workflow"
            title="Your First Workflow"
            description="Create a simple Telegram notification workflow in 5 minutes"
          />
          <LinkCard
            href="/docs/getting-started/understanding-nodes"
            title="Understanding Nodes"
            description="Learn about different types of nodes and how to use them"
          />
          <LinkCard
            href="/docs/getting-started/connecting-nodes"
            title="Connecting Nodes"
            description="Master the art of connecting nodes to build powerful workflows"
          />
          <LinkCard
            href="/docs/credentials"
            title="Setting Up Credentials"
            description="Learn how to connect Buzz8n with external services"
          />
        </div>
      </section>
    </div>
  )
}
