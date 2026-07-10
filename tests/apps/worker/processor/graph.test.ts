import { describe, expect, test } from 'bun:test'
import {
  buildGraph,
  collectReachableFrom,
  initialReady,
  validateDAG,
  type RFEdge,
  type RFNode,
} from '../../../../apps/worker/src/processor/graph'

describe('processor graph helpers', () => {
  test('detects a cycle', () => {
    const nodes: RFNode[] = [{ id: 'a' }, { id: 'b' }]
    const edges: RFEdge[] = [
      { id: '1', source: 'a', target: 'b' },
      { id: '2', source: 'b', target: 'a' },
    ]
    const allowed = new Set(['a', 'b'])

    const { children, indegree } = buildGraph(nodes, edges, allowed)

    expect(() => validateDAG(children, indegree)).toThrow(/Cycle/)
  })

  test('collectReachableFrom does not follow reverse edges', () => {
    const edges: RFEdge[] = [
      { id: '1', source: 't', target: 'a' },
      { id: '2', source: 'x', target: 'a' },
    ]

    expect([...collectReachableFrom('t', edges)].sort()).toEqual(['a', 't'])
  })

  test('initialReady returns deterministic sorted ids', () => {
    const indegree = new Map([
      ['c', 0],
      ['a', 0],
      ['b', 1],
    ])

    expect(initialReady(indegree)).toEqual(['a', 'c'])
  })
})
