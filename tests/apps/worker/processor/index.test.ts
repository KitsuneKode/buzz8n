import { beforeEach, describe, expect, mock, test } from 'bun:test'
import * as commonTypes from '../../../../packages/common/src/types'

const operations: string[] = []

const xAddDlq = mock(async () => {
  operations.push('dlq')
  return 'dlq-id'
})
const xAck = mock(async () => {
  operations.push('ack')
  return 1
})
const prismaFindFirst = mock(async () => ({
  id: 'execution-1',
  userId: 'user-1',
  workflow: {
    nodes: { invalid: true },
    edges: [],
  },
}))
const nodesSafeParse = mock(() => ({ success: false }))
const edgesSafeParse = mock(() => ({ success: true, data: [] }))

mock.module('@/redis', () => ({
  redis: {
    xAck,
    xAddDlq,
  },
}))

mock.module('@/utils', () => ({
  logger: {
    debug: mock(() => {}),
    error: mock(() => {}),
    info: mock(() => {}),
    warn: mock(() => {}),
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    execution: {
      findFirst: prismaFindFirst,
    },
  },
}))

mock.module('@buzz8n/common/types', () => ({
  ...commonTypes,
  edgesSchema: {
    safeParse: edgesSafeParse,
  },
  nodesSchema: {
    safeParse: nodesSafeParse,
  },
}))

mock.module('@/processor/dag', () => ({
  buildGraph: mock(() => ({ children: new Map(), indegree: new Map(), nodeMap: new Map() })),
  collectReachableFrom: mock(() => new Set()),
  executeGraphConcurrent: mock(async () => ({})),
  validateDAG: mock(() => {}),
}))

mock.module('@/processor/helper', () => ({
  beginExecutionSetStatus: mock(async () => {}),
  collapsePropertyNodes: mock(() => ({
    executableNodes: [],
    filteredEdges: [],
    nonExecutableIds: new Set(),
  })),
}))

mock.module('@/nodes', () => ({
  runNode: mock(async () => ({})),
}))

const { processResponse } = await import('../../../../apps/worker/src/processor/index')

describe('processResponse', () => {
  beforeEach(() => {
    operations.length = 0
    xAddDlq.mockClear()
    xAck.mockClear()
    prismaFindFirst.mockClear()
    nodesSafeParse.mockClear()
    edgesSafeParse.mockClear()
  })

  test('writes invalid workflow definitions to the DLQ before ACKing the stream message', async () => {
    await processResponse({
      id: 'message-1',
      payload: {
        workflowId: 'workflow-1',
        executionId: 'execution-1',
        data: {
          triggerType: 'manualTrigger',
          body: {},
        },
      },
    })

    expect(xAddDlq).toHaveBeenCalledWith({
      originalId: 'message-1',
      reason: 'invalid_workflow_definition',
      payload: expect.stringContaining('"workflowId":"workflow-1"'),
      at: expect.any(String),
    })
    expect(xAck).toHaveBeenCalledWith({ messageID: 'message-1' })
    expect(operations).toEqual(['dlq', 'ack'])
  })
})
