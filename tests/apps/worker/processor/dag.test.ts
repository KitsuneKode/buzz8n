import { describe, test, expect } from 'bun:test'

// Import the functions to test
import { collectReachableFrom, buildGraph, validateDAG } from '@apps/worker/src/processor/dag'
import type { RFNode, RFEdge } from '@apps/worker/src/processor/dag'

describe('DAG Processor', () => {
  describe('collectReachableFrom', () => {
    test('should return only the start node when no edges exist', () => {
      const edges: RFEdge[] = []
      const result = collectReachableFrom('start', edges)

      expect(result.size).toBe(1)
      expect(result.has('start')).toBe(true)
    })

    test('should collect all reachable nodes in a linear chain', () => {
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'middle' },
        { id: 'e2', source: 'middle', target: 'end' },
      ]
      const result = collectReachableFrom('start', edges)

      expect(result.size).toBe(3)
      expect(result.has('start')).toBe(true)
      expect(result.has('middle')).toBe(true)
      expect(result.has('end')).toBe(true)
    })

    test('should collect all reachable nodes in a branching graph', () => {
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'branch1' },
        { id: 'e2', source: 'start', target: 'branch2' },
        { id: 'e3', source: 'branch1', target: 'end' },
        { id: 'e4', source: 'branch2', target: 'end' },
      ]
      const result = collectReachableFrom('start', edges)

      expect(result.size).toBe(4)
      expect(result.has('start')).toBe(true)
      expect(result.has('branch1')).toBe(true)
      expect(result.has('branch2')).toBe(true)
      expect(result.has('end')).toBe(true)
    })

    test('should not include unreachable nodes', () => {
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'reachable' },
        { id: 'e2', source: 'unreachable1', target: 'unreachable2' },
      ]
      const result = collectReachableFrom('start', edges)

      expect(result.size).toBe(2)
      expect(result.has('start')).toBe(true)
      expect(result.has('reachable')).toBe(true)
      expect(result.has('unreachable1')).toBe(false)
      expect(result.has('unreachable2')).toBe(false)
    })

    test('should handle cycles without infinite loop', () => {
      const edges: RFEdge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
        { id: 'e3', source: 'c', target: 'a' }, // Cycle back to a
      ]
      const result = collectReachableFrom('a', edges)

      expect(result.size).toBe(3)
      expect(result.has('a')).toBe(true)
      expect(result.has('b')).toBe(true)
      expect(result.has('c')).toBe(true)
    })

    test('should handle complex diamond-shaped DAG', () => {
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'left' },
        { id: 'e2', source: 'start', target: 'right' },
        { id: 'e3', source: 'left', target: 'middle' },
        { id: 'e4', source: 'right', target: 'middle' },
        { id: 'e5', source: 'middle', target: 'end' },
      ]
      const result = collectReachableFrom('start', edges)

      expect(result.size).toBe(5)
      expect(result.has('start')).toBe(true)
      expect(result.has('left')).toBe(true)
      expect(result.has('right')).toBe(true)
      expect(result.has('middle')).toBe(true)
      expect(result.has('end')).toBe(true)
    })
  })

  describe('buildGraph', () => {
    test('should build empty graph when no nodes are allowed', () => {
      const nodes: RFNode[] = [
        { id: 'node1', data: { type: 'test' } },
        { id: 'node2', data: { type: 'test' } },
      ]
      const edges: RFEdge[] = [{ id: 'e1', source: 'node1', target: 'node2' }]
      const allowed = new Set<string>()

      const { nodeMap, children, indegree } = buildGraph(nodes, edges, allowed)

      expect(nodeMap.size).toBe(0)
      expect(children.size).toBe(0)
      expect(indegree.size).toBe(0)
    })

    test('should build graph with only allowed nodes', () => {
      const nodes: RFNode[] = [
        { id: 'node1', data: { type: 'test' } },
        { id: 'node2', data: { type: 'test' } },
        { id: 'node3', data: { type: 'test' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'node1', target: 'node2' },
        { id: 'e2', source: 'node2', target: 'node3' },
      ]
      const allowed = new Set(['node1', 'node2']) // Exclude node3

      const { nodeMap, children, indegree } = buildGraph(nodes, edges, allowed)

      expect(nodeMap.size).toBe(2)
      expect(nodeMap.has('node1')).toBe(true)
      expect(nodeMap.has('node2')).toBe(true)
      expect(nodeMap.has('node3')).toBe(false)

      expect(children.get('node1')).toEqual(['node2'])
      expect(indegree.get('node1')).toBe(0)
      expect(indegree.get('node2')).toBe(1)
    })

    test('should correctly calculate indegrees', () => {
      const nodes: RFNode[] = [
        { id: 'start', data: { type: 'webhook' } },
        { id: 'middle1', data: { type: 'ai' } },
        { id: 'middle2', data: { type: 'email' } },
        { id: 'end', data: { type: 'telegram' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'middle1' },
        { id: 'e2', source: 'start', target: 'middle2' },
        { id: 'e3', source: 'middle1', target: 'end' },
        { id: 'e4', source: 'middle2', target: 'end' },
      ]
      const allowed = new Set(['start', 'middle1', 'middle2', 'end'])

      const { indegree } = buildGraph(nodes, edges, allowed)

      expect(indegree.get('start')).toBe(0) // No incoming edges
      expect(indegree.get('middle1')).toBe(1) // One incoming from start
      expect(indegree.get('middle2')).toBe(1) // One incoming from start
      expect(indegree.get('end')).toBe(2) // Two incoming from middle1 and middle2
    })

    test('should ignore edges where source or target is not allowed', () => {
      const nodes: RFNode[] = [
        { id: 'node1', data: { type: 'test' } },
        { id: 'node2', data: { type: 'test' } },
        { id: 'node3', data: { type: 'test' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'node1', target: 'node2' },
        { id: 'e2', source: 'node2', target: 'node3' }, // node3 not allowed
        { id: 'e3', source: 'node3', target: 'node1' }, // node3 not allowed
      ]
      const allowed = new Set(['node1', 'node2'])

      const { children, indegree } = buildGraph(nodes, edges, allowed)

      expect(children.get('node1')).toEqual(['node2'])
      expect(children.get('node2')).toEqual([])
      expect(indegree.get('node1')).toBe(0)
      expect(indegree.get('node2')).toBe(1)
    })

    test('should handle nodes with no edges', () => {
      const nodes: RFNode[] = [
        { id: 'isolated1', data: { type: 'test' } },
        { id: 'isolated2', data: { type: 'test' } },
      ]
      const edges: RFEdge[] = []
      const allowed = new Set(['isolated1', 'isolated2'])

      const { nodeMap, children, indegree } = buildGraph(nodes, edges, allowed)

      expect(nodeMap.size).toBe(2)
      expect(children.get('isolated1')).toEqual([])
      expect(children.get('isolated2')).toEqual([])
      expect(indegree.get('isolated1')).toBe(0)
      expect(indegree.get('isolated2')).toBe(0)
    })
  })

  describe('validateDAG', () => {
    test('should not throw for a valid DAG', () => {
      const children = new Map<string, string[]>([
        ['a', ['b', 'c']],
        ['b', ['d']],
        ['c', ['d']],
        ['d', []],
      ])
      const indegree = new Map<string, number>([
        ['a', 0],
        ['b', 1],
        ['c', 1],
        ['d', 2],
      ])

      expect(() => validateDAG(children, indegree)).not.toThrow()
    })

    test('should throw error when cycle is detected', () => {
      const children = new Map<string, string[]>([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['a']], // Cycle back to a
      ])
      const indegree = new Map<string, number>([
        ['a', 1], // Incoming from c
        ['b', 1], // Incoming from a
        ['c', 1], // Incoming from b
      ])

      expect(() => validateDAG(children, indegree)).toThrow('Cycle detected: not a DAG')
    })

    test('should throw error for self-loop', () => {
      const children = new Map<string, string[]>([
        ['a', ['a']], // Self-loop
      ])
      const indegree = new Map<string, number>([
        ['a', 1], // Incoming from itself
      ])

      expect(() => validateDAG(children, indegree)).toThrow('Cycle detected: not a DAG')
    })

    test('should not throw for linear chain', () => {
      const children = new Map<string, string[]>([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['d']],
        ['d', []],
      ])
      const indegree = new Map<string, number>([
        ['a', 0],
        ['b', 1],
        ['c', 1],
        ['d', 1],
      ])

      expect(() => validateDAG(children, indegree)).not.toThrow()
    })

    test('should not throw for disconnected components', () => {
      const children = new Map<string, string[]>([
        ['a', ['b']],
        ['b', []],
        ['c', ['d']],
        ['d', []],
      ])
      const indegree = new Map<string, number>([
        ['a', 0],
        ['b', 1],
        ['c', 0],
        ['d', 1],
      ])

      expect(() => validateDAG(children, indegree)).not.toThrow()
    })

    test('should throw for complex cycle', () => {
      const children = new Map<string, string[]>([
        ['a', ['b', 'c']],
        ['b', ['d']],
        ['c', ['d']],
        ['d', ['e']],
        ['e', ['b']], // Cycle: b -> d -> e -> b
      ])
      const indegree = new Map<string, number>([
        ['a', 0],
        ['b', 2], // From a and e
        ['c', 1],
        ['d', 2],
        ['e', 1],
      ])

      expect(() => validateDAG(children, indegree)).toThrow('Cycle detected: not a DAG')
    })

    test('should not throw for empty graph', () => {
      const children = new Map<string, string[]>()
      const indegree = new Map<string, number>()

      expect(() => validateDAG(children, indegree)).not.toThrow()
    })

    test('should not throw for single node', () => {
      const children = new Map<string, string[]>([['a', []]])
      const indegree = new Map<string, number>([['a', 0]])

      expect(() => validateDAG(children, indegree)).not.toThrow()
    })
  })

  describe('DAG Integration Scenarios', () => {
    test('should handle webhook trigger workflow', () => {
      const nodes: RFNode[] = [
        { id: 'webhook', data: { type: 'webhook' } },
        { id: 'ai', data: { type: 'ai-agent' } },
        { id: 'email', data: { type: 'email' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'webhook', target: 'ai' },
        { id: 'e2', source: 'ai', target: 'email' },
      ]

      const reachable = collectReachableFrom('webhook', edges)
      const { nodeMap, children, indegree } = buildGraph(nodes, edges, reachable)

      expect(reachable.size).toBe(3)
      expect(() => validateDAG(children, indegree)).not.toThrow()
      expect(indegree.get('webhook')).toBe(0)
      expect(indegree.get('ai')).toBe(1)
      expect(indegree.get('email')).toBe(1)
    })

    test('should handle parallel execution branches', () => {
      const nodes: RFNode[] = [
        { id: 'trigger', data: { type: 'manualTrigger' } },
        { id: 'email1', data: { type: 'email' } },
        { id: 'email2', data: { type: 'email' } },
        { id: 'telegram', data: { type: 'telegram' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'trigger', target: 'email1' },
        { id: 'e2', source: 'trigger', target: 'email2' },
        { id: 'e3', source: 'trigger', target: 'telegram' },
      ]

      const reachable = collectReachableFrom('trigger', edges)
      const { children, indegree } = buildGraph(nodes, edges, reachable)

      expect(reachable.size).toBe(4)
      expect(() => validateDAG(children, indegree)).not.toThrow()
      expect(indegree.get('email1')).toBe(1)
      expect(indegree.get('email2')).toBe(1)
      expect(indegree.get('telegram')).toBe(1)
    })

    test('should handle diamond dependency pattern', () => {
      const nodes: RFNode[] = [
        { id: 'start', data: { type: 'webhook' } },
        { id: 'process1', data: { type: 'ai-agent' } },
        { id: 'process2', data: { type: 'ai-agent' } },
        { id: 'combine', data: { type: 'email' } },
      ]
      const edges: RFEdge[] = [
        { id: 'e1', source: 'start', target: 'process1' },
        { id: 'e2', source: 'start', target: 'process2' },
        { id: 'e3', source: 'process1', target: 'combine' },
        { id: 'e4', source: 'process2', target: 'combine' },
      ]

      const reachable = collectReachableFrom('start', edges)
      const { children, indegree } = buildGraph(nodes, edges, reachable)

      expect(reachable.size).toBe(4)
      expect(() => validateDAG(children, indegree)).not.toThrow()
      expect(indegree.get('combine')).toBe(2) // Waits for both process1 and process2
    })
  })
})
