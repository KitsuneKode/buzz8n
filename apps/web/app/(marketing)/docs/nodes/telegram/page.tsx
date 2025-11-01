/* eslint-disable no-useless-escape */
import { Callout, CodeBlock, LinkCard } from '@/components/docs'
import { IconBrandTelegram } from '@tabler/icons-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Telegram Node | Buzz8n Documentation',
  description: 'Learn how to send Telegram messages from your workflows using the Telegram node.',
}

export default function TelegramNodePage() {
  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <IconBrandTelegram className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="mb-0">Telegram: Send Message</h1>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium">
                Action
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-medium">
                Stable
              </span>
            </div>
          </div>
        </div>
        <p className="lead">
          Send messages to Telegram users, groups, or channels from your workflows.
        </p>
      </header>

      <Callout type="info">
        <strong>Prerequisites:</strong>
        <ul className="mt-2 mb-0">
          <li>
            A Telegram bot token -{' '}
            <a href="/docs/credentials/telegram" className="underline">
              Get one here
            </a>
          </li>
          <li>The Chat ID of the recipient (user, group, or channel)</li>
        </ul>
      </Callout>

      <section>
        <h2>Overview</h2>
        <p>
          The Telegram node lets you send text messages through your Telegram bot. You can send
          messages to:
        </p>
        <ul>
          <li>Individual users (private chats)</li>
          <li>Groups (where your bot is a member)</li>
          <li>Channels (where your bot is an admin)</li>
        </ul>
        <p>This is perfect for notifications, alerts, reports, or building interactive bots.</p>
      </section>

      <section>
        <h2>Configuration</h2>
        <p>The Telegram node requires three fields to work:</p>

        <div className="space-y-6 my-6">
          <div className="border-l-4 border-primary pl-6 py-2">
            <h3 className="text-lg font-semibold mb-2">1. Credential</h3>
            <p className="text-sm mb-2">
              <strong>Type:</strong> <code>Telegram Credential</code> (required)
            </p>
            <p className="text-sm">
              Select a Telegram bot credential that you&apos;ve set up in Buzz8n. If you
              haven&apos;t created one yet,{' '}
              <a href="/docs/credentials/telegram" className="underline">
                follow this guide
              </a>
              .
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6 py-2">
            <h3 className="text-lg font-semibold mb-2">2. Chat ID</h3>
            <p className="text-sm mb-2">
              <strong>Type:</strong> <code>String or Number</code> (required)
            </p>
            <p className="text-sm mb-2">
              The unique identifier for the chat where you want to send the message. This can be:
            </p>
            <ul className="text-sm space-y-1">
              <li>
                <strong>User ID:</strong> A positive number (e.g., <code>123456789</code>)
              </li>
              <li>
                <strong>Group ID:</strong> A negative number (e.g., <code>-987654321</code>)
              </li>
              <li>
                <strong>Channel username:</strong> Starting with @ (e.g., <code>@mychannel</code>)
              </li>
            </ul>
            <Callout type="tip" title="How to find Chat ID">
              <ol className="text-sm mt-2">
                <li>Send a message to your bot</li>
                <li>
                  Visit:{' '}
                  <code className="text-xs">
                    https://api.telegram.org/bot&lt;YOUR_TOKEN&gt;/getUpdates
                  </code>
                </li>
                <li>
                  Find the <code>&quot;id&quot;</code> under <code>&quot;chat&quot;</code>
                </li>
              </ol>
            </Callout>
          </div>

          <div className="border-l-4 border-primary pl-6 py-2">
            <h3 className="text-lg font-semibold mb-2">3. Message</h3>
            <p className="text-sm mb-2">
              <strong>Type:</strong> <code>String</code> (required)
            </p>
            <p className="text-sm">
              The text message to send. Supports Telegram&apos;s text formatting:
            </p>
            <ul className="text-sm">
              <li>
                <strong>Bold:</strong> <code>*text*</code> or <code>**text**</code>
              </li>
              <li>
                <strong>Italic:</strong> <code>_text_</code>
              </li>
              <li>
                <strong>Code:</strong> <code>`text`</code>
              </li>
              <li>
                <strong>Links:</strong> <code>[text](url)</code>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>Example Messages</h2>

        <h3>Simple Text Message</h3>
        <CodeBlock language="text">{`Hello from Buzz8n! Your workflow is working. 🎉`}</CodeBlock>

        <h3>Formatted Message</h3>
        <CodeBlock language="text">
          {`*Workflow Alert*

Your workflow has completed successfully!

Status: _Running_
Duration: 2.5s
Time: \`2025-01-15 10:30:00\`

[View Dashboard](https://your-domain.com/dashboard)`}
        </CodeBlock>

        <h3>Using Dynamic Data</h3>
        <p>You can reference data from previous nodes in your message:</p>
        <CodeBlock language="text">
          {`New order received! 🛒

Order ID: \{\{$node["Webhook"].json.orderId\}\}
Customer: \{\{$node["Webhook"].json.customerName\}\}
Total: \{\{$node["Webhook"].json.total\}\}

Please process this order.`}
        </CodeBlock>
        <Callout type="info">
          Variable syntax may vary based on your workflow configuration. Check the node output data
          to see available fields.
        </Callout>
      </section>

      <section>
        <h2>Output Data</h2>
        <p>When the message is sent successfully, the node returns:</p>
        <CodeBlock language="json">
          {`{
  "ok": true,
  "result": {
    "message_id": 123,
    "from": {
      "id": 1234567890,
      "is_bot": true,
      "first_name": "Your Bot Name",
      "username": "your_bot"
    },
    "chat": {
      "id": 987654321,
      "first_name": "Recipient Name",
      "type": "private"
    },
    "date": 1705315800,
    "text": "Your message content"
  }
}`}
        </CodeBlock>
        <p className="text-sm text-muted-foreground">
          You can use <code>message_id</code> in subsequent nodes to reference this message.
        </p>
      </section>

      <section>
        <h2>Common Use Cases</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">1. Notifications & Alerts</h3>
            <p className="text-sm">
              Get notified when important events happen in your app (new orders, errors, form
              submissions, etc.)
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">2. Status Reports</h3>
            <p className="text-sm">
              Send daily/weekly reports about your system&apos;s status, metrics, or analytics
              directly to Telegram
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">3. Customer Support</h3>
            <p className="text-sm">
              Build a bot that forwards customer messages to your support team via Telegram
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">4. Monitoring & DevOps</h3>
            <p className="text-sm">
              Monitor your servers and get instant alerts about downtime, high CPU usage, or
              deployment status
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Example Workflows</h2>

        <h3>Webhook to Telegram Notification</h3>
        <p>Receive a Telegram message whenever your webhook receives data:</p>
        <div className="bg-muted/30 rounded-lg p-4 my-4 border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Webhook Trigger</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">Send Telegram Message</span>
          </div>
        </div>

        <h3>AI Analysis with Telegram Output</h3>
        <p>Use AI to analyze data and send the results to Telegram:</p>
        <div className="bg-muted/30 rounded-lg p-4 my-4 border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Webhook</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">AI Agent</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm font-medium">Send Telegram</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Troubleshooting</h2>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Error: &quot;Chat not found&quot;
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>This error occurs when:</p>
            <ul>
              <li>The Chat ID is incorrect</li>
              <li>The user hasn&apos;t started a conversation with your bot</li>
              <li>Your bot was removed from the group/channel</li>
            </ul>
            <p>
              <strong>Solution:</strong> Make sure the user has messaged your bot at least once, and
              verify the Chat ID using the getUpdates method.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Error: &quot;Forbidden: bot was blocked by the user&quot;
          </summary>
          <div className="mt-3 text-sm">
            <p>The user has blocked your bot on Telegram.</p>
            <p>
              <strong>Solution:</strong> Ask the user to unblock your bot before sending messages.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Error: &quot;Unauthorized&quot;
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>Your bot token is invalid or has been revoked.</p>
            <p>
              <strong>Solution:</strong> Check your credential in Buzz8n and make sure the bot token
              is correct. If needed, generate a new token from @BotFather.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Messages aren&apos;t being delivered to groups
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>For groups, make sure:</p>
            <ul>
              <li>Your bot is a member of the group</li>
              <li>The bot has permission to send messages</li>
              <li>Group privacy settings allow bots</li>
              <li>You&apos;re using the correct negative Chat ID</li>
            </ul>
          </div>
        </details>
      </section>

      <section>
        <h2>Best Practices</h2>
        <Callout type="tip">
          <ul className="my-2">
            <li>
              <strong>Keep messages concise:</strong> Telegram has a 4096 character limit per
              message
            </li>
            <li>
              <strong>Use formatting:</strong> Make messages easier to read with bold, italic, and
              code formatting
            </li>
            <li>
              <strong>Handle errors gracefully:</strong> Add error handling nodes in case the
              message fails to send
            </li>
            <li>
              <strong>Test with your own account:</strong> Always test messages with your own Chat
              ID first
            </li>
            <li>
              <strong>Respect rate limits:</strong> Don&apos;t spam users - Telegram has rate limits
              to prevent abuse
            </li>
          </ul>
        </Callout>
      </section>

      <section>
        <h2>Related Documentation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/credentials/telegram"
            title="Setup Telegram Credentials"
            description="Learn how to create a Telegram bot and get your token"
          />
          <LinkCard
            href="/docs/tutorials/telegram-bot"
            title="Build a Telegram Bot"
            description="Complete tutorial for building a Telegram bot"
          />
          <LinkCard
            href="/docs/nodes/webhook"
            title="Webhook Trigger"
            description="Combine webhooks with Telegram for powerful notifications"
          />
          <LinkCard
            href="/docs/getting-started/your-first-workflow"
            title="Your First Workflow"
            description="Learn the basics with a Telegram workflow tutorial"
          />
        </div>
      </section>
    </div>
  )
}
