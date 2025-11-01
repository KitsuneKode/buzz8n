/* eslint-disable react/no-unescaped-entities */
import { Callout, Steps, CodeBlock, LinkCard } from '@/components/docs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your First Workflow | Buzz8n Documentation',
  description:
    'Learn how to create your first automated workflow in Buzz8n. This step-by-step tutorial takes about 5 minutes.',
}

export default function YourFirstWorkflowPage() {
  return (
    <div>
      <header className="mb-8">
        <h1>Your First Workflow</h1>
        <p className="lead">
          Create a simple workflow that sends you a Telegram message when you click a button. This
          tutorial takes about 5 minutes.
        </p>
      </header>

      <Callout type="info">
        <strong>What you'll build:</strong> A workflow with a Manual Trigger that sends a message to
        your Telegram account.
      </Callout>

      <section>
        <h2>Prerequisites</h2>
        <p>Before you begin, make sure you have:</p>
        <ul>
          <li>A Buzz8n account (sign up if you haven&apos;t already)</li>
          <li>
            A Telegram account and bot token (
            <a href="/docs/credentials/telegram" className="underline">
              learn how to get one
            </a>
            )
          </li>
        </ul>
      </section>

      <section>
        <h2>Step-by-Step Guide</h2>

        <Steps>
          <Steps.Step number={1} title="Create a New Workflow">
            <p>
              From your dashboard, click the <strong>"New Workflow"</strong> or <strong>"+"</strong>{' '}
              button in the top right corner.
            </p>
            <p>
              Give your workflow a descriptive name like <strong>"My First Telegram Bot"</strong>{' '}
              and click <strong>Create</strong>.
            </p>
            <Callout type="tip">
              Use clear names for your workflows so you can easily find them later!
            </Callout>
          </Steps.Step>

          <Steps.Step number={2} title="Set Up Telegram Credentials">
            <p>Before adding nodes, you need to set up your Telegram credentials:</p>
            <ol>
              <li>
                Click <strong>"Credentials"</strong> in the top navigation bar
              </li>
              <li>
                Click <strong>"Add Credential"</strong> or the <strong>"+"</strong> button
              </li>
              <li>
                Select <strong>"Telegram"</strong> from the provider list
              </li>
              <li>
                Give it a name like <strong>"My Telegram Bot"</strong>
              </li>
              <li>Paste your bot token in the token field</li>
              <li>
                Click <strong>"Save"</strong>
              </li>
            </ol>

            <Callout type="warning" title="Don't have a bot token yet?">
              <p>You need to create a Telegram bot first:</p>
              <ol>
                <li>
                  Open Telegram and search for <strong>@BotFather</strong>
                </li>
                <li>
                  Send the command <code>/newbot</code>
                </li>
                <li>Follow the prompts to name your bot</li>
                <li>Copy the bot token that BotFather gives you</li>
              </ol>
              <p>
                <a href="/docs/credentials/telegram" className="underline">
                  Read the full guide
                </a>
              </p>
            </Callout>
          </Steps.Step>

          <Steps.Step number={3} title="Understand the Manual Trigger Node">
            <p>
              When you create a new workflow, Buzz8n automatically adds a{' '}
              <strong>Manual Trigger</strong> node. This is your starting point!
            </p>
            <p>The Manual Trigger node starts your workflow when you click the play button.</p>
            <Callout type="info">
              Every workflow needs a trigger node. The Manual Trigger is perfect for testing and
              workflows you want to run on-demand.
            </Callout>
          </Steps.Step>

          <Steps.Step number={4} title="Add a Telegram Node">
            <p>Now let's add a node to send a Telegram message:</p>
            <ol>
              <li>
                Look for the <strong>+ button</strong> on the right side of the Manual Trigger node
              </li>
              <li>Click it to open the node palette</li>
              <li>
                Search for <strong>"Telegram"</strong> or browse the actions
              </li>
              <li>
                Click <strong>"Send a message"</strong> to add it to your workflow
              </li>
            </ol>
            <p>
              You'll see the Telegram node appear, connected to your Manual Trigger with a line
              (edge).
            </p>
          </Steps.Step>

          <Steps.Step number={5} title="Configure the Telegram Node">
            <p>
              Click on the Telegram node to open its configuration panel on the right side of the
              screen.
            </p>
            <p>You'll need to fill in three fields:</p>

            <div className="my-4 space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-1">1. Select Credential</h4>
                <p className="text-sm m-0">
                  Choose the Telegram bot credential you created in Step 2.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-1">2. Chat ID</h4>
                <p className="text-sm">This is your Telegram user ID. To find it:</p>
                <ol className="text-sm mt-2">
                  <li>Open Telegram and send any message to your bot</li>
                  <li>Open this URL in your browser (replace YOUR_BOT_TOKEN):</li>
                </ol>
                <CodeBlock language="text">
                  {`https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`}
                </CodeBlock>
                <p className="text-sm">
                  Look for the <code>"id"</code> field under <code>"chat"</code> - that's your Chat
                  ID!
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-1">3. Message</h4>
                <p className="text-sm m-0">Type the message you want to send. For example:</p>
                <CodeBlock language="text">{`Hello from Buzz8n! 🎉 My first workflow is working!`}</CodeBlock>
              </div>
            </div>

            <Callout type="warning">
              If you see a red warning icon on the node, it means some required fields are empty.
              Make sure all three fields are filled in!
            </Callout>
          </Steps.Step>

          <Steps.Step number={6} title="Save Your Workflow">
            <p>
              Before testing, save your work! Click the <strong>"Save"</strong> button in the top
              right corner.
            </p>
            <p>You should see a success message confirming your workflow has been saved.</p>
          </Steps.Step>

          <Steps.Step number={7} title="Test Your Workflow">
            <p>Time to see your workflow in action!</p>
            <ol>
              <li>
                Click on the <strong>Manual Trigger node</strong>
              </li>
              <li>
                A <strong>Play button</strong> will appear on the left side of the node
              </li>
              <li>Click the Play button to run your workflow</li>
            </ol>
            <p>Watch as your workflow executes! You'll see:</p>
            <ul>
              <li>The nodes light up as they execute</li>
              <li>A loading indicator while the message is being sent</li>
              <li>A green checkmark when it's complete</li>
            </ul>

            <Callout type="success">
              <strong>Success!</strong> Check your Telegram - you should have received the message
              from your bot!
            </Callout>
          </Steps.Step>

          <Steps.Step number={8} title="View Execution Logs">
            <p>Want to see what happened behind the scenes?</p>
            <ol>
              <li>
                Look for the <strong>"Executions"</strong> tab at the bottom or right panel
              </li>
              <li>Click on the latest execution to see detailed logs</li>
              <li>You can see the input and output of each node</li>
            </ol>
            <Callout type="tip">
              Execution logs are super helpful for debugging when things don't work as expected!
            </Callout>
          </Steps.Step>
        </Steps>
      </section>

      <section>
        <h2>Troubleshooting</h2>
        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            I'm not receiving the Telegram message
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>If you're not receiving messages, check these common issues:</p>
            <ul>
              <li>
                <strong>Did you message your bot first?</strong> You must send at least one message
                to your bot before it can message you back.
              </li>
              <li>
                <strong>Is your Chat ID correct?</strong> Double-check the ID by visiting the
                getUpdates URL again.
              </li>
              <li>
                <strong>Is your bot token valid?</strong> Try sending a test request to the Telegram
                API to verify.
              </li>
              <li>
                <strong>Check the execution logs</strong> for any error messages.
              </li>
            </ul>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            I see a red warning icon on my node
          </summary>
          <div className="mt-3 text-sm">
            <p>
              The red warning icon means your node configuration is incomplete. Click on the node to
              see which fields need to be filled in. All required fields must have values before the
              workflow can run.
            </p>
          </div>
        </details>

        <details className="border rounded-lg p-4 mb-4">
          <summary className="cursor-pointer font-semibold">
            The workflow execution failed with an error
          </summary>
          <div className="mt-3 text-sm space-y-2">
            <p>
              Check the execution logs to see the specific error message. Common errors include:
            </p>
            <ul>
              <li>
                <strong>Invalid bot token:</strong> Your credential might be incorrect
              </li>
              <li>
                <strong>Invalid chat ID:</strong> Make sure you copied the correct ID
              </li>
              <li>
                <strong>Network error:</strong> Check your internet connection
              </li>
            </ul>
          </div>
        </details>
      </section>

      <Callout type="success" title="Congratulations!">
        You've created your first workflow! 🎉 You now know the basics of building automations with
        Buzz8n.
      </Callout>

      <section>
        <h2>What's Next?</h2>
        <p>Now that you've mastered the basics, here are some ideas for what to learn next:</p>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkCard
            href="/docs/nodes/webhook"
            title="Use Webhooks"
            description="Learn how to trigger workflows from external services"
          />
          <LinkCard
            href="/docs/nodes/ai-agent"
            title="Add AI to Your Workflows"
            description="Use AI agents to make your workflows smarter"
          />
          <LinkCard
            href="/docs/tutorials/telegram-bot"
            title="Build a Full Telegram Bot"
            description="Create a bot that responds to commands and messages"
          />
          <LinkCard
            href="/docs/credentials/email"
            title="Send Automated Emails"
            description="Set up email credentials and send automated emails"
          />
        </div>
      </section>
    </div>
  )
}
