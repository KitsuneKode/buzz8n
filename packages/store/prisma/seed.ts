import { PrismaClient, SupportedPlatforms, Methods, ExecutionStatus } from '../src/generated/client'
import { password as Password } from 'bun'

const prisma = new PrismaClient()

// Helper function to generate random data
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.execution.deleteMany()
  await prisma.webhook.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.credential.deleteMany()
  await prisma.user.deleteMany()

  // Generate single test user
  console.log('👥 Creating test user...')

  // Alternative: Generate 50 users (commented out)
  // const userCount = 50
  // const firstNames = ['Alex', 'Jordan', 'Taylor', ...]
  // const lastNames = ['Smith', 'Johnson', 'Williams', ...]
  // const domains = ['example.com', 'test.com', ...]
  // for (let i = 0; i < userCount; i++) { ... }

  const passwordHash = await Password.hash('Test123!@#', {
    algorithm: 'bcrypt',
    cost: 10,
  })

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password_hash: passwordHash,
    },
  })

  const users = [user]

  console.log('\n' + '='.repeat(60))
  console.log('🔑 LOGIN CREDENTIALS')
  console.log('='.repeat(60))
  console.log(`Email:    ${user.email}`)
  console.log(`Password: Test123!@#`)
  console.log('='.repeat(60) + '\n')

  console.log(`✅ Created test user`)

  // Generate credentials for each user
  console.log('🔑 Creating credentials...')
  const credentials = []
  const credentialTypes = ['OpenAI', 'Anthropic', 'Gemini', 'Email', 'Telegram']

  // Generate more credentials for the single test user
  const credentialCount = randomInt(15, 25) // 15-25 credentials for testing

  // Alternative: Loop through users (uncomment to use multiple users with 2-8 credentials each)
  // for (const user of users) {
  //   const credentialCount = randomInt(2, 8)

  for (let i = 0; i < credentialCount; i++) {
    const platform = randomElement(credentialTypes) as SupportedPlatforms

    let data: Record<string, any> = {}

    switch (platform) {
      case 'OpenAI':
        data = {
          apiKey: `sk-${Array.from({ length: 40 }, () => '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 62))).join('')}`,
          organizationId: `org-${randomInt(100000, 999999)}`,
        }
        break
      case 'Anthropic':
        data = {
          apiKey: `sk-ant-${Array.from({ length: 48 }, () => '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 62))).join('')}`,
          version: `2024-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28)}`,
        }
        break
      case 'Gemini':
        data = {
          apiKey: `${randomInt(1000000, 9999999)}-${randomInt(1000000, 9999999)}`,
          projectId: `project-${randomInt(100000, 999999)}`,
        }
        break
      case 'Email':
        data = {
          smtpHost: `smtp.${randomElement(['gmail', 'outlook', 'yahoo', 'custom'])}.com`,
          smtpPort: randomElement([465, 587, 993]),
          username: user.email,
          password: `email-pass-${randomInt(100000, 999999)}`,
        }
        break
      case 'Telegram':
        data = {
          botToken: `${randomInt(100000000, 999999999)}:${Array.from({ length: 35 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.charAt(Math.floor(Math.random() * 64))).join('')}`,
          chatId: `-${randomInt(100000000, 999999999)}`,
        }
        break
    }

    const credential = await prisma.credential.create({
      data: {
        title: `${platform} ${i + 1} - ${user.name}`,
        platform,
        data,
        userId: user.id,
      },
    })

    credentials.push(credential)
  }

  console.log(`✅ Created ${credentials.length} credentials`)

  // Generate workflows
  console.log('🔄 Creating workflows...')
  const workflows = []
  const workflowTemplates = [
    {
      name: 'Customer Support Automation',
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'Email Received' } },
        { id: '2', type: 'llm', data: { label: 'Analyze Intent' } },
        { id: '3', type: 'condition', data: { label: 'Route Request' } },
        { id: '4', type: 'action', data: { label: 'Send Response' } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' },
      ],
    },
    {
      name: 'Content Generation Pipeline',
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'Content Request' } },
        { id: '2', type: 'llm', data: { label: 'Generate Draft' } },
        { id: '3', type: 'llm', data: { label: 'Proofread' } },
        { id: '4', type: 'action', data: { label: 'Publish' } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' },
      ],
    },
    {
      name: 'Data Processing Workflow',
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'Data Ingest' } },
        { id: '2', type: 'transform', data: { label: 'Clean Data' } },
        { id: '3', type: 'llm', data: { label: 'Extract Insights' } },
        { id: '4', type: 'action', data: { label: 'Save Results' } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' },
      ],
    },
  ]

  for (const user of users) {
    const workflowCount = randomInt(3, 15) // 3-15 workflows per user

    for (let i = 0; i < workflowCount; i++) {
      const template = randomElement(workflowTemplates)
      const isActive = Math.random() > 0.7 // 30% chance of being active
      const isArchived = Math.random() > 0.9 // 10% chance of being archived

      const workflow = await prisma.workflow.create({
        data: {
          name: `${template.name} ${i + 1}`,
          active: isActive && !isArchived,
          nodes: template.nodes,
          edges: template.edges,
          userId: user.id,
          archived: isArchived,
          status: isActive ? 'success' : Math.random() > 0.8 ? 'error' : 'initial',
        },
      })

      workflows.push(workflow)
    }
  }

  console.log(`✅ Created ${workflows.length} workflows`)

  // Generate webhooks for some workflows
  console.log('🔗 Creating webhooks...')
  const webhooks = []
  const activeWorkflows = workflows.filter((w) => w.active && !w.archived)

  for (const workflow of activeWorkflows.slice(0, Math.floor(activeWorkflows.length * 0.3))) {
    // 30% of active workflows have webhooks
    const webhook = await prisma.webhook.create({
      data: {
        method: randomElement(['POST', 'GET', 'PUT']) as Methods,
        path: `/webhook/${workflow.id}`, // Use full ID to ensure uniqueness
        secret: `whsec_${Array.from({ length: 32 }, () => '0123456789abcdef'.charAt(Math.floor(Math.random() * 16))).join('')}`,
        workflowId: workflow.id,
      },
    })

    webhooks.push(webhook)
  }

  console.log(`✅ Created ${webhooks.length} webhooks`)

  // Generate executions
  console.log('⚡ Creating executions...')
  const statuses: ExecutionStatus[] = ['initial', 'loading', 'success', 'error']
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3) // 3 months ago

  let executionCount = 0

  for (const workflow of workflows) {
    if (workflow.archived) continue // Skip archived workflows

    const executionCountForWorkflow = randomInt(5, 50) // 5-50 executions per workflow

    for (let i = 0; i < executionCountForWorkflow; i++) {
      const status = randomElement(statuses)
      const startedAt = randomDate(startDate, new Date())
      const finishedAt =
        status !== 'initial' ? new Date(startedAt.getTime() + randomInt(1000, 300000)) : null
      const durationMs = finishedAt ? finishedAt.getTime() - startedAt.getTime() : null

      const summaries = [
        'Successfully processed request',
        'Failed to connect to external API',
        'Completed in 2.3 seconds',
        'Validation error: missing required field',
        'Timeout after 30 seconds',
        'Successfully generated content',
        'Rate limit exceeded',
        'Completed successfully with warnings',
      ]

      await prisma.execution.create({
        data: {
          workflowId: workflow.id,
          userId: workflow.userId,
          status,
          startedAt,
          finishedAt,
          durationMs,
          summary: randomElement(summaries),
          logs: [
            { level: 'info', message: 'Execution started', timestamp: startedAt },
            ...(finishedAt
              ? [
                  {
                    level: status === 'success' ? 'info' : 'error',
                    message: status === 'success' ? 'Execution completed' : 'Execution failed',
                    timestamp: finishedAt,
                  },
                ]
              : []),
          ],
        },
      })

      executionCount++
    }
  }

  console.log(`✅ Created ${executionCount} executions`)

  console.log('\n✅ Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Credentials: ${credentials.length}`)
  console.log(`   Workflows: ${workflows.length}`)
  console.log(`   Webhooks: ${webhooks.length}`)
  console.log(`   Executions: ${executionCount}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
