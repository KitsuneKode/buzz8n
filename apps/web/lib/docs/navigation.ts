export interface DocSection {
  title: string
  href?: string
  badge?: 'new' | 'beta' | 'coming-soon'
  items?: DocSection[]
}

export const docsNavigation: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/getting-started' },
      { title: 'Your First Workflow', href: '/docs/getting-started/your-first-workflow' },
      { title: 'Understanding Nodes', href: '/docs/getting-started/understanding-nodes' },
      { title: 'Connecting Nodes', href: '/docs/getting-started/connecting-nodes' },
    ],
  },
  {
    title: 'Workflows',
    items: [
      { title: 'Overview', href: '/docs/workflows' },
      { title: 'Creating Workflows', href: '/docs/workflows/creating' },
      { title: 'Editing Workflows', href: '/docs/workflows/editing' },
      { title: 'Testing & Debugging', href: '/docs/workflows/testing' },
      { title: 'Activating Workflows', href: '/docs/workflows/activating' },
    ],
  },
  {
    title: 'Credentials',
    items: [
      { title: 'What are Credentials?', href: '/docs/credentials' },
      { title: 'Telegram Bot', href: '/docs/credentials/telegram' },
      { title: 'Email (Resend)', href: '/docs/credentials/email' },
      { title: 'OpenAI', href: '/docs/credentials/openai' },
      { title: 'Google Gemini', href: '/docs/credentials/gemini' },
      { title: 'Anthropic Claude', href: '/docs/credentials/claude' },
      { title: 'OAuth', href: '/docs/credentials/oauth', badge: 'coming-soon' },
    ],
  },
  {
    title: 'Nodes',
    items: [
      {
        title: 'Triggers',
        items: [
          { title: 'Manual Trigger', href: '/docs/nodes/manual-trigger' },
          { title: 'Webhook', href: '/docs/nodes/webhook' },
        ],
      },
      {
        title: 'Actions',
        items: [
          { title: 'Telegram', href: '/docs/nodes/telegram' },
          { title: 'Email', href: '/docs/nodes/email' },
        ],
      },
      {
        title: 'AI',
        items: [{ title: 'AI Agent', href: '/docs/nodes/ai-agent' }],
      },
      {
        title: 'Tools',
        badge: 'beta',
        items: [
          { title: 'Sum', href: '/docs/nodes/tools/sum' },
          { title: 'Multiply', href: '/docs/nodes/tools/multiply' },
          { title: 'Exponential', href: '/docs/nodes/tools/exponential' },
        ],
      },
    ],
  },
  {
    title: 'Tutorials',
    items: [
      { title: 'Build a Telegram Bot', href: '/docs/tutorials/telegram-bot' },
      { title: 'Email Automation', href: '/docs/tutorials/email-automation' },
      { title: 'AI Chatbot', href: '/docs/tutorials/ai-chatbot', badge: 'new' },
      { title: 'Webhook Listener', href: '/docs/tutorials/webhook-listener' },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting' },
      { title: 'Node Configuration', href: '/docs/troubleshooting/node-configuration' },
      { title: 'Credentials', href: '/docs/troubleshooting/credentials' },
      { title: 'Execution Failures', href: '/docs/troubleshooting/execution' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Changelog', href: '/docs/resources/changelog' },
      { title: 'Roadmap', href: '/docs/resources/roadmap' },
      { title: 'FAQ', href: '/docs/resources/faq' },
    ],
  },
]
