/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Pure graph helpers for workflow DAG processing.
 *
 * These functions only operate on node and edge data structures, so they can be
 * tested independently from the executor's persistence and event side effects.
 */

/**
 * Minimal node shape the executor needs: a unique id and optional data for dispatch/config.
 */
export type RFNode = {
  id: string
  data?: { type?: string; config?: Record<string, any> }
} & Record<string, any>

/**
 * Minimal directed edge shape: id, source, and target encode the arrow u -> v in the DAG.
 */
export type RFEdge = { id: string; source: string; target: string } & Record<string, any>

/**
 * Treat these as “do not execute”: they unlock downstream nodes but aren’t run as tasks.
 */
export const TRIGGER_TYPES = new Set(['webhook', 'manualTrigger'])

/**
 * Computes the forward-reachable set of node ids from a starting node by following directed
 * edges source -> target.
 */
export function collectReachableFrom(startId: string, edges: RFEdge[]): Set<string> {
  const children = new Map<string, string[]>()
  for (const edge of edges) {
    if (!children.has(edge.source)) children.set(edge.source, [])
    children.get(edge.source)!.push(edge.target)
  }

  const seen = new Set<string>()
  const queue = [startId]
  while (queue.length) {
    const nodeId = queue.shift()!
    if (seen.has(nodeId)) continue
    seen.add(nodeId)
    for (const childId of children.get(nodeId) ?? []) queue.push(childId)
  }
  return seen
}

/**
 * Builds graph structures (node map, forward adjacency, and indegree counts) limited to the
 * provided allowed node ids.
 */
export function buildGraph(nodes: RFNode[], edges: RFEdge[], allowed: Set<string>) {
  const nodeMap = new Map(
    nodes.filter((node) => allowed.has(node.id)).map((node) => [node.id, node]),
  )
  const children = new Map<string, string[]>()
  const indegree = new Map<string, number>()

  for (const id of nodeMap.keys()) {
    children.set(id, [])
    indegree.set(id, 0)
  }

  for (const edge of edges) {
    if (!allowed.has(edge.source) || !allowed.has(edge.target)) continue
    children.get(edge.source)!.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  return { nodeMap, children, indegree }
}

/**
 * Collects node ids that have zero remaining prerequisites to seed the ready queue.
 */
export function initialReady(indegree: Map<string, number>): string[] {
  return Array.from(indegree)
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort()
}

/**
 * Checks that the directed graph contains no cycles by performing a dry run of Kahn's algorithm.
 */
export function validateDAG(children: Map<string, string[]>, indegree: Map<string, number>): void {
  const copy = new Map(indegree)
  const queue = initialReady(copy)
  let seen = 0

  while (queue.length) {
    const nodeId = queue.shift()!
    seen++
    for (const childId of children.get(nodeId) ?? []) {
      copy.set(childId, copy.get(childId)! - 1)
      if (copy.get(childId) === 0) {
        queue.push(childId)
        queue.sort()
      }
    }
  }

  if (seen !== indegree.size) throw new Error('Cycle detected: not a DAG')
}
