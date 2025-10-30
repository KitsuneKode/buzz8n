import { Node, Edge } from '@xyflow/react'

/**
 * Get all nodes that come BEFORE targetNodeId in the DAG.
 *
 * These are nodes whose outputs can be referenced by the target.
 */
export function getUpstreamNodes(targetNodeId: string, allNodes: Node[], allEdges: Edge[]): Node[] {
  const upstream = new Set<string>()
  const queue = [targetNodeId]
  const visited = new Set<string>()

  // BFS backwards through edges
  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    // Find edges pointing TO current
    const incomingEdges = allEdges.filter((e) => e.target === current)
    for (const edge of incomingEdges) {
      if (edge.source !== targetNodeId) {
        upstream.add(edge.source)
        queue.push(edge.source)
      }
    }
  }

  return allNodes.filter((n) => upstream.has(n.id))
}
