import { Callout, CodeBlock, LinkCard } from '@/components/docs'
import { Play } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual Trigger Node | Buzz8n Documentation',
  description:
    'Learn how to use the Manual Trigger node to start workflows on-demand with a button click.',
}

export default function ManualTriggerNodePage() {
  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="mb-0">Manual Trigger</h1>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium">
                Trigger
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-medium">
                Stable
              </span>
            </div>
          </div>
        </div>
        <p className="lead">
          Start your workflow manually by clicking a button. Perfect for testing workflows and
          on-demand automations.
        </p>
      </header>

      <section>
        <h2>Overview</h2>
        <p>
          The Manual Trigger is the simplest way to start a workflow. When you click the play
          button, your workflow begins executing. Every new workflow starts with a Manual Trigger by
          default.
        </p>

        <Callout type="info">
          <strong>When to use Manual Trigger:</strong>
          <ul className="mt-2 mb-0">
            <li>Testing new workflows before going live</li>
            <li>Running workflows on-demand (e.g., generating reports)</li>
            <li>Workflows that don&apos;t need automatic triggering</li>
            <li>Learning and experimenting with Buzz8n</li>
          </ul>
        </Callout>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>
          The Manual Trigger node is automatically added when you create a new workflow. Here&apos;s
          how to use it:
        </p>
        <ol>
          <li>
            <strong>Automatic placement:</strong> The Manual Trigger is always the first node in
            your workflow
          </li>
          <li>
            <strong>No configuration needed:</strong> This node works out of the box - no setup
            required!
          </li>
          <li>
            <strong>Click to run:</strong> Select the Manual Trigger node and click the play button
            that appears
          </li>
          <li>
            <strong>Watch execution:</strong> Your workflow will run and you can see the results in
            real-time
          </li>
        </ol>
      </section>

      <section>
        <h2>Configuration</h2>
        <p>
          The Manual Trigger has <strong>no configuration options</strong>. It&apos;s ready to use
          as soon as you create a workflow.
        </p>

        <div className="border rounded-lg p-6 my-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-3">Node Properties</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">Property</th>
                <th className="text-left py-2 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Type</td>
                <td className="py-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">Trigger</code>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Category</td>
                <td className="py-2">Triggers</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Credentials Required</td>
                <td className="py-2">None</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Configuration</td>
                <td className="py-2">None required</td>
              </tr>
              <tr>
                <td className="py-2">Output</td>
                <td className="py-2">Empty object {`{}`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Using Manual Trigger</h2>
        <h3>Running Your Workflow</h3>
        <ol>
          <li>Open your workflow in the editor</li>
          <li>
            Click on the <strong>Manual Trigger node</strong> to select it
          </li>
          <li>
            A <strong>play button (▶️)</strong> will appear on the left side of the node
          </li>
          <li>Click the play button to start the execution</li>
        </ol>

        <Callout type="tip" title="Keyboard Shortcut">
          You can quickly run your workflow by selecting the Manual Trigger and pressing{' '}
          <kbd className="px-2 py-1 bg-muted rounded border text-xs">Enter</kbd>
        </Callout>
      </section>

      <section>
        <h2>Output Data</h2>
        <p>
          The Manual Trigger node doesn&apos;t pass any data to the next nodes. It returns an empty
          object:
        </p>
        <CodeBlock language="json">{`{}`}</CodeBlock>
        <p>
          If you need to pass initial data to your workflow, you&apos;ll need to configure it in the
          nodes that follow the trigger.
        </p>
      </section>

      <section>
        <h2>Example Workflows</h2>

        <h3>Example 1: Simple Notification</h3>
        <p>Send yourself a Telegram message when you click a button:</p>
        <div className="bg-muted/30 rounded-lg p-4 my-4 border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span className="text-sm font-medium">Manual Trigger</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Send Telegram Message</span>
            </div>
          </div>
        </div>
        <p>
          <a href="/docs/getting-started/your-first-workflow" className="underline">
            Follow the tutorial
          </a>
        </p>

        <h3>Example 2: Daily Report Generator</h3>
        <p>Manually trigger a workflow that generates and emails a report:</p>
        <div className="bg-muted/30 rounded-lg p-4 my-4 border">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span className="text-sm font-medium">Manual Trigger</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">Fetch Data (API)</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">AI Agent (Analyze)</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">Send Email</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Limitations</h2>
        <ul>
          <li>
            <strong>Manual only:</strong> This trigger requires a human to click the button - it
            can&apos;t run automatically
          </li>
          <li>
            <strong>No input data:</strong> You can&apos;t pass custom data through the Manual
            Trigger
          </li>
          <li>
            <strong>Not for production automation:</strong> For automatic workflows, use{' '}
            <a href="/docs/nodes/webhook" className="underline">
              Webhook
            </a>{' '}
            or other automated triggers
          </li>
        </ul>
      </section>

      <section>
        <h2>Best Practices</h2>
        <Callout type="tip">
          <ul className="my-2">
            <li>
              <strong>Use for testing:</strong> Always test new workflows with Manual Trigger before
              switching to automatic triggers
            </li>
            <li>
              <strong>Name your workflow clearly:</strong> Use descriptive names so you remember
              what the workflow does
            </li>
            <li>
              <strong>Check execution logs:</strong> After running, review the logs to ensure
              everything worked correctly
            </li>
            <li>
              <strong>Keep it simple at first:</strong> Start with Manual Trigger, test thoroughly,
              then switch to automated triggers if needed
            </li>
          </ul>
        </Callout>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Can I remove the Manual Trigger node?
          </summary>
          <div className="mt-3 text-sm">
            <p>
              Yes, you can delete it and replace it with another trigger like Webhook. Every
              workflow needs at least one trigger node, but it doesn&apos;t have to be a Manual
              Trigger.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Can I have multiple Manual Triggers in one workflow?
          </summary>
          <div className="mt-3 text-sm">
            <p>
              Technically yes, but it&apos;s not recommended. Workflows typically have one trigger
              node. If you need multiple entry points, consider creating separate workflows.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            How do I upgrade from Manual Trigger to automatic execution?
          </summary>
          <div className="mt-3 text-sm">
            <p>Replace the Manual Trigger with a Webhook trigger or other automated trigger:</p>
            <ol>
              <li>Delete the Manual Trigger node</li>
              <li>Add a new trigger node (e.g., Webhook)</li>
              <li>Connect it to your workflow</li>
              <li>Configure the new trigger</li>
            </ol>
          </div>
        </details>
      </section>

      <section>
        <h2>Related Documentation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/nodes/webhook"
            title="Webhook Trigger"
            description="Start workflows automatically from external services"
          />
          <LinkCard
            href="/docs/getting-started/your-first-workflow"
            title="Your First Workflow"
            description="Tutorial using the Manual Trigger"
          />
          <LinkCard
            href="/docs/workflows/testing"
            title="Testing Workflows"
            description="Learn how to test and debug your workflows"
          />
          <LinkCard
            href="/docs/workflows/activating"
            title="Activating Workflows"
            description="Make your workflows run automatically"
          />
        </div>
      </section>
    </div>
  )
}
