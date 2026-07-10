import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import type { ExecContext, RunNode } from '../../../../apps/worker/src/nodes'

const publishNodeEvent = mock(() => Promise.resolve())
const endExecutionSetStatus = mock(() => Promise.resolve(0))

mock.module('@/services/publisher', () => ({
  publishNodeEvent,
}))

mock.module('@/processor/helper', () => ({
  endExecutionSetStatus,
  renderGraphAscii: () => [],
}))

const { buildGraph, executeGraphConcurrent } = await import(
  '../../../../apps/worker/src/processor/dag'
)

function createContext(): ExecContext {
  return {
    userId: 'user-1',
    logs: [],
    $json: {
      body: {},
      executionId: 'execution-1',
      workflowId: 'workflow-1',
    },
    $node: {},
  }
}

describe('executeGraphConcurrent', () => {
  beforeEach(() => {
    publishNodeEvent.mockClear()
    endExecutionSetStatus.mockClear()
  })

  afterEach(() => {
    delete process.env.DAG_MAX_CONCURRENCY
  })

  test('independent branches complete before their dependent node', async () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'join' }]
    const edges = [
      { id: 'a-join', source: 'a', target: 'join' },
      { id: 'b-join', source: 'b', target: 'join' },
    ]
    const { nodeMap, children, indegree } = buildGraph(
      nodes,
      edges,
      new Set(nodes.map((node) => node.id)),
    )
    const started: string[] = []
    const runNode: RunNode = async (node) => {
      started.push(node.id)
      return { ok: true, nodeId: node.id }
    }

    const { summary } = await executeGraphConcurrent(nodeMap, children, indegree, createContext(), runNode, {
      maxConcurrency: 2,
      startTime: Date.now(),
    })

    expect(summary).toMatchObject({ success: true, completed: 3, failed: 0, total: 3 })
    expect(started.slice(0, 2).sort()).toEqual(['a', 'b'])
    expect(started[2]).toBe('join')
  })

  test('failFast prevents dependents of a failed node from running', async () => {
    const nodes = [{ id: 'a' }, { id: 'b' }]
    const edges = [{ id: 'a-b', source: 'a', target: 'b' }]
    const { nodeMap, children, indegree } = buildGraph(
      nodes,
      edges,
      new Set(nodes.map((node) => node.id)),
    )
    const started: string[] = []
    const runNode: RunNode = async (node) => {
      started.push(node.id)
      throw new Error(`boom ${node.id}`)
    }

    await expect(
      executeGraphConcurrent(nodeMap, children, indegree, createContext(), runNode, {
        maxConcurrency: 1,
        startTime: Date.now(),
      }),
    ).rejects.toThrow('Execution FAILED')

    expect(started).toEqual(['a'])
  })

  test('uses DAG_MAX_CONCURRENCY when maxConcurrency option is omitted', async () => {
    process.env.DAG_MAX_CONCURRENCY = '1'
    const nodes = [{ id: 'a' }, { id: 'b' }]
    const { nodeMap, children, indegree } = buildGraph(
      nodes,
      [],
      new Set(nodes.map((node) => node.id)),
    )
    let running = 0
    let observedMaxRunning = 0
    const runNode: RunNode = async () => {
      running++
      observedMaxRunning = Math.max(observedMaxRunning, running)
      await Promise.resolve()
      running--
      return { ok: true }
    }

    await executeGraphConcurrent(nodeMap, children, indegree, createContext(), runNode, {
      startTime: Date.now(),
    })

    expect(observedMaxRunning).toBe(1)
  })
})
