/* eslint-disable react/no-unescaped-entities */
import { Callout, Steps, CodeBlock, LinkCard } from '@/components/docs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Telegram Bot Setup | Buzz8n Documentation',
  description:
    'Learn how to create a Telegram bot and connect it to Buzz8n for sending messages and notifications.',
}

export default function TelegramCredentialsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1>Setting Up Telegram Bot Credentials</h1>
        <p className="lead">
          Learn how to create a Telegram bot and connect it to Buzz8n so you can send messages,
          notifications, and build interactive bots.
        </p>
      </header>

      <Callout type="info">
        <strong>Time required:</strong> About 5 minutes
        <br />
        <strong>Prerequisites:</strong> A Telegram account
      </Callout>

      <section>
        <h2>What You&apos;ll Get</h2>
        <p>After completing this guide, you&apos;ll have:</p>
        <ul>
          <li>A Telegram bot with a unique token</li>
          <li>Your Chat ID for sending messages to yourself</li>
          <li>A configured credential in Buzz8n ready to use</li>
        </ul>
      </section>

      <section>
        <h2>Step-by-Step Guide</h2>

        <Steps>
          <Steps.Step number={1} title="Open Telegram and Find BotFather">
            <p>
              <strong>BotFather</strong> is Telegram's official bot for creating and managing other
              bots.
            </p>
            <ol>
              <li>Open Telegram (mobile app or desktop)</li>
              <li>
                In the search bar, type <code>@BotFather</code>
              </li>
              <li>Select the verified BotFather bot (it has a blue checkmark)</li>
              <li>
                Click <strong>"Start"</strong> to begin chatting with BotFather
              </li>
            </ol>
            <Callout type="warning">
              Make sure you're chatting with the <strong>real</strong> BotFather (@BotFather) -
              there are fake bots with similar names!
            </Callout>
          </Steps.Step>

          <Steps.Step number={2} title="Create Your Bot">
            <p>Now let's create a new bot:</p>
            <ol>
              <li>
                Send the command <code>/newbot</code> to BotFather
              </li>
              <li>
                BotFather will ask for a <strong>name</strong> for your bot (e.g., "My Buzz8n Bot")
              </li>
              <li>
                Then it will ask for a <strong>username</strong>. This must:
                <ul>
                  <li>End with "bot" (e.g., "mybuzz8n_bot")</li>
                  <li>Be unique across all of Telegram</li>
                  <li>Only contain letters, numbers, and underscores</li>
                </ul>
              </li>
              <li>
                If the username is available, BotFather will create your bot and give you a{' '}
                <strong>token</strong>
              </li>
            </ol>
          </Steps.Step>

          <Steps.Step number={3} title="Save Your Bot Token">
            <p>
              After creating your bot, BotFather will send you a message containing your bot token.
              It looks like this:
            </p>
            <CodeBlock language="text">{`1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-1234567`}</CodeBlock>
            <Callout type="warning" title="Keep Your Token Secret!">
              <p>Your bot token is like a password. Anyone with this token can control your bot!</p>
              <ul>
                <li>Never share it publicly</li>
                <li>Don't commit it to Git repositories</li>
                <li>Store it securely in Buzz8n's credential system</li>
              </ul>
            </Callout>
            <p>Copy this token - you'll need it in the next steps.</p>
          </Steps.Step>

          <Steps.Step number={4} title="Get Your Chat ID">
            <p>To send messages to yourself, you need your Chat ID:</p>
            <ol>
              <li>
                Open Telegram and search for your bot using the username you just created (e.g.,
                @mybuzz8n_bot)
              </li>
              <li>
                Click <strong>"Start"</strong> or send any message to your bot (e.g., "Hello")
              </li>
              <li>
                Now, open this URL in your web browser (replace YOUR_BOT_TOKEN with your actual
                token):
              </li>
            </ol>
            <CodeBlock language="text">{`https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`}</CodeBlock>
            <p>You'll see JSON data that looks like this:</p>
            <CodeBlock language="json">
              {`{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 987654321,
          "is_bot": false,
          "first_name": "Your Name"
        },
        "chat": {
          "id": 987654321,
          "first_name": "Your Name",
          "type": "private"
        },
        "text": "Hello"
      }
    }
  ]
}`}
            </CodeBlock>
            <p>
              Look for the <code>"id"</code> field under <code>"chat"</code>. In this example,
              it&apos;s <code>987654321</code>. That&apos;s your Chat ID!
            </p>
            <Callout type="tip">
              If you don&apos;t see any results, make sure you sent a message to your bot first
              (Step 2 above).
            </Callout>
          </Steps.Step>

          <Steps.Step number={5} title="Add Credential to Buzz8n">
            <p>Now let&apos;s add your Telegram bot to Buzz8n:</p>
            <ol>
              <li>Log in to your Buzz8n dashboard</li>
              <li>
                Click <strong>"Credentials"</strong> in the top navigation
              </li>
              <li>
                Click <strong>"Add Credential"</strong> or the <strong>"+"</strong> button
              </li>
              <li>
                Select <strong>"Telegram"</strong> from the provider list
              </li>
              <li>
                Fill in the form:
                <ul>
                  <li>
                    <strong>Name:</strong> Give it a memorable name (e.g., "My Telegram Bot")
                  </li>
                  <li>
                    <strong>Bot Token:</strong> Paste the token from Step 3
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>"Save"</strong>
              </li>
            </ol>
            <Callout type="success">
              Great! Your Telegram bot is now connected to Buzz8n and ready to use in workflows.
            </Callout>
          </Steps.Step>

          <Steps.Step number={6} title="Test Your Credential">
            <p>Let&apos;s make sure everything works:</p>
            <ol>
              <li>Create a new workflow or open an existing one</li>
              <li>Add a Telegram "Send a message" node</li>
              <li>Select your newly created credential</li>
              <li>Enter your Chat ID from Step 4</li>
              <li>
                Type a test message like <code>"Testing my Telegram bot! 🎉"</code>
              </li>
              <li>Run the workflow</li>
            </ol>
            <p>You should receive the message on Telegram!</p>
          </Steps.Step>
        </Steps>
      </section>

      <section>
        <h2>Advanced Configuration</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            How do I send messages to a group or channel?
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>To send messages to a Telegram group or channel:</p>
            <ol>
              <li>Add your bot to the group/channel</li>
              <li>For groups: Make your bot an admin (or allow bots to post)</li>
              <li>
                Get the group/channel Chat ID:
                <ul>
                  <li>Send a message in the group/channel</li>
                  <li>Visit the getUpdates URL (same as Step 4)</li>
                  <li>
                    Look for <code>"chat"</code> with <code>"type": "group"</code> or{' '}
                    <code>"supergroup"</code>
                  </li>
                  <li>
                    The Chat ID might be negative (e.g., <code>-1001234567890</code>)
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            Can I customize my bot's profile picture and description?
          </summary>
          <div className="mt-3 text-sm">
            <p>Yes! Talk to BotFather and use these commands:</p>
            <ul>
              <li>
                <code>/setuserpic</code> - Set a profile picture
              </li>
              <li>
                <code>/setdescription</code> - Set the description users see when they start your
                bot
              </li>
              <li>
                <code>/setabouttext</code> - Set the "About" text in your bot's profile
              </li>
              <li>
                <code>/setcommands</code> - Set command buttons that appear in the chat
              </li>
            </ul>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            How do I regenerate my bot token if it's compromised?
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>If your bot token is exposed:</p>
            <ol>
              <li>Open a chat with @BotFather</li>
              <li>
                Send <code>/mybots</code>
              </li>
              <li>Select your bot</li>
              <li>
                Click <strong>"API Token"</strong>
              </li>
              <li>
                Click <strong>&quot;Revoke current token&quot;</strong>
              </li>
              <li>BotFather will generate a new token</li>
              <li>Update the token in your Buzz8n credential</li>
            </ol>
            <Callout type="warning">
              The old token will stop working immediately after revocation!
            </Callout>
          </div>
        </details>
      </section>

      <section>
        <h2>Troubleshooting</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            &quot;Bot token is invalid&quot; error
          </summary>
          <div className="mt-3 text-sm">
            <p>If you're getting this error:</p>
            <ul>
              <li>Make sure you copied the entire token (no spaces before/after)</li>
              <li>Check that you didn't accidentally modify any characters</li>
              <li>Verify the token hasn't been revoked</li>
              <li>Try generating a new token from BotFather</li>
            </ul>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            &quot;Chat not found&quot; error
          </summary>
          <div className="mt-3 text-sm">
            <p>This usually means:</p>
            <ul>
              <li>You haven&apos;t started a chat with your bot yet</li>
              <li>The Chat ID is incorrect</li>
              <li>The Chat ID might need to be negative (for groups)</li>
            </ul>
            <p>
              Solution: Send a message to your bot, then get the Chat ID again using getUpdates.
            </p>
          </div>
        </details>
      </section>

      <Callout type="success">
        Congratulations! Your Telegram bot is fully configured and ready to send messages through
        Buzz8n workflows.
      </Callout>

      <section>
        <h2>What's Next?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/nodes/telegram"
            title="Telegram Node Documentation"
            description="Learn all the ways you can use Telegram in your workflows"
          />
          <LinkCard
            href="/docs/tutorials/telegram-bot"
            title="Build a Telegram Bot Tutorial"
            description="Create a complete bot that responds to commands"
          />
          <LinkCard
            href="/docs/getting-started/your-first-workflow"
            title="Your First Workflow"
            description="Use your new credential in a simple workflow"
          />
          <LinkCard
            href="/docs/nodes/webhook"
            title="Webhook Trigger"
            description="Combine webhooks with Telegram for powerful notifications"
          />
        </div>
      </section>
    </div>
  )
}
