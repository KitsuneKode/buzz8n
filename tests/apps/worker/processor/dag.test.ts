import { describe, expect, test } from 'bun:test'
import {
  buildGraph,
  collectReachableFrom,
  validateDAG,
  type RFEdge,
  type RFNode,
} from '../../../../apps/worker/src/processor/dag.ts'

describe('DAG processor', () => {
  const nodes: RFNode[] = [
    { id: 't1', data: { type: 'manualTrigger' } },
    { id: 'a', data: { type: 'emailSend' } },
    { id: 'b', data: { type: 'telegramSendMessage' } },
  ]
  const edges: RFEdge[] = [
    { id: 'e1', source: 't1', target: 'a' },
    { id: 'e2', source: 'a', target: 'b' },
  ]

  test('collectReachableFrom returns forward subgraph', () => {
    const reachable = collectReachableFrom('t1', edges)
    expect(reachable.has('t1')).toBe(true)
    expect(reachable.has('a')).toBe(true)
    expect(reachable.has('b')).toBe(true)
  })

  test('buildGraph + validateDAG succeeds for acyclic graph', () => {
    const allowed = new Set(nodes.map((n) => n.id))
    const { children, indegree } = buildGraph(nodes, edges, allowed)
    expect(() => validateDAG(children, indegree)).not.toThrow()
    expect(indegree.get('t1')).toBe(0)
    expect(indegree.get('a')).toBe(1)
    expect(indegree.get('b')).toBe(1)
  })

  test('validateDAG throws on cycle', () => {
    const cyclic: RFEdge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' },
    ]
    const cycleNodes: RFNode[] = [
      { id: 'a', data: { type: 'emailSend' } },
      { id: 'b', data: { type: 'telegramSendMessage' } },
    ]
    const allowed = new Set(['a', 'b'])
    const { children, indegree } = buildGraph(cycleNodes, cyclic, allowed)
    expect(() => validateDAG(children, indegree)).toThrow()
  })
})
