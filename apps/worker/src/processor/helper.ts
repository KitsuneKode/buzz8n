/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExecutionStatus } from '@buzz8n/common/types'
import type { RFEdge, RFNode } from '@/processor/dag'
import { prisma } from '@buzz8n/store'
import { redis } from '@/redis'

const INACTIVITY_TIMEOUT = 1 * 60 * 60 //1h
const workflowKey = (id: string) => `workflow:${id}:active_count`
const subGraphCategories = ['ai-agent-tools']

/**
 * Increment the workflow's active-execution counter, refresh its inactivity TTL, and mark the workflow active when this is the first running execution.
 *
 * @returns The updated active execution count for the workflow.
 */
export async function beginExecutionSetStatus(
  workflowId: string,
  executionId: string,
  startTime: number,
): Promise<number> {
  const WORKFLOW_ACTIVE_COUNT_KEY = workflowKey(workflowId)
  const count = await redis.incr(WORKFLOW_ACTIVE_COUNT_KEY) // creates WORKFLOW_ACTIVE_COUNT_KEY if missing, returns new value
  const redisPromise = redis.expire(WORKFLOW_ACTIVE_COUNT_KEY, INACTIVITY_TIMEOUT) // refresh inactivity window
  const prismaPromise = prisma.execution.update({
    where: { id: executionId },
    data: { startedAt: new Date(startTime).toISOString(), status: 'loading' },
  })

  await Promise.all([redisPromise, prismaPromise])

  if (count === 1) {
    await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'loading' } })
  }
  return count
}

/**
 * Decrements the workflow's active-execution counter, refreshes its inactivity TTL, and sets the workflow inactive when the counter reaches zero; if the counter goes negative the Redis key is removed and the workflow is set inactive.
 *
 * @returns The current active-execution counter for the workflow after decrement.
 */
export async function endExecutionSetStatus(
  workflowId: string,
  status: ExecutionStatus,
): Promise<number> {
  const WORKFLOW_ACTIVE_COUNT_KEY = workflowKey(workflowId)
  const count = await redis.decr(WORKFLOW_ACTIVE_COUNT_KEY) // returns new value after decrement
  await redis.expire(WORKFLOW_ACTIVE_COUNT_KEY, INACTIVITY_TIMEOUT) // keep only inactive keys expiring
  if (count === 0) {
    if (status === 'success') {
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'success' },
      })
    } else {
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'error' },
      })
    }
  }
  if (count < 0) {
    await redis.del(WORKFLOW_ACTIVE_COUNT_KEY)
    if (status === 'success') {
      await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'success' } })
    } else {
      await prisma.workflow.update({ where: { id: workflowId }, data: { status: 'error' } })
    }
  }
  return count
}

/**
 * Collapse non-executable “property” nodes (e.g., agent tools) into their parent node’s config.
 * Returns:
 *  - executableNodes: nodes that remain as DAG vertices
 *  - filteredEdges: edges only between executable nodes
 *  - nonExecutableIds: ids that were absorbed (for diagnostics)
 *
 * Convention:
 *  - A node is considered non-executable if it has a parentId and its type matches the tool set.
 *  - Collapsed tools are appended to parent.data.config.allowedTools as metadata for runNode.
 */

export function collapsePropertyNodes(
  nodes: RFNode[],
  edges: RFEdge[],
  isProperty?: (n: RFNode) => boolean,
) {
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]))
  const nonExecutableIds = new Set<string>()
  const executableNodes: RFNode[] = []
  // Accumulate tools into parent config
  for (const n of nodes) {
    if (
      isProperty?.(n) ??
      (!!(n as any).parentId &&
        subGraphCategories.includes(((n.data as any)?.category ?? '') as string))
    ) {
      nonExecutableIds.add(n.id)
      const parentId = (n as any).parentId as string | undefined
      if (!parentId || !byId.has(parentId)) continue
      const parent = byId.get(parentId)!
      parent.data = parent.data ?? {}
      parent.data.config = parent.data.config ?? {}
      const arr = (parent.data.config.allowedTools ??= [])
      arr.push({
        id: n.id,
        type: n.data?.type,
        label: (n.data as any)?.label,
        config: n.data?.config ?? {},
      })
    }
  }

  // Keep only executable nodes
  for (const n of nodes) {
    if (!nonExecutableIds.has(n.id)) executableNodes.push(byId.get(n.id)!)
  }

  // Keep only edges between executable nodes
  const execIds = new Set(executableNodes.map((n) => n.id))
  const filteredEdges = edges.filter((e) => execIds.has(e.source) && execIds.has(e.target))

  return { executableNodes, filteredEdges, nonExecutableIds }
}

/**
 * Produce a compact ASCII snapshot of a directed acyclic graph.
 *
 * The output enumerates the total node count, source nodes (indegree = 0),
 * Kahn-style layers (waves), and a per-node outgoing edges listing. Node
 * labels include the node id and, if present, the node's `data.type`.
 *
 * @param nodeMap - Map from node id to node object (node's `data.type` is used for labels when available)
 * @param children - Adjacency list mapping node id to its outgoing neighbor ids
 * @param indegree - Map of node id to its indegree used to compute layers
 * @returns An array of lines forming the ASCII snapshot: node count, sources, layer lines, an "Edges:" section with "id (type) -> [V1, V2]" lines, and two trailing newlines
 */
export function renderGraphAscii(
  nodeMap: Map<string, any>,
  children: Map<string, string[]>,
  indegree: Map<string, number>,
): string[] {
  const ids = Array.from(nodeMap.keys())

  // Edges list
  const edgesLines = ids.map((id) => {
    const outs = children.get(id) ?? []
    const label = `${id}${nodeMap.get(id)?.data?.type ? ` (${nodeMap.get(id)!.data.type})` : ''}`
    return `${label} -> [${outs.join(', ')}]`
  })

  // Kahn layering for waves
  const indeg = new Map(indegree)
  let current = ids.filter((id) => (indeg.get(id) ?? 0) === 0)
  const sources = [...current]
  const layers: string[][] = []
  const seen = new Set<string>()

  while (current.length) {
    layers.push(current)
    const next: string[] = []
    for (const u of current) {
      if (seen.has(u)) continue
      seen.add(u)
      for (const v of children.get(u) ?? []) {
        indeg.set(v, (indeg.get(v) ?? 0) - 1)
        if (indeg.get(v) === 0) next.push(v)
      }
    }
    // Dedup to keep layer clean
    current = Array.from(new Set(next))
  }

  const lines: string[] = []

  lines.push(`[DAG] Nodes: ${nodeMap.size}`)
  lines.push(`[DAG] Sources (indegree=0): ${sources.join(', ') || '(none)'}`)
  layers.forEach((layer, i) => lines.push(`[DAG] Layer ${i}: ${layer.join(', ') || '(empty)'}`))
  lines.push(`[DAG] Edges:`)
  edgesLines.forEach((l) => lines.push(`  ${l}`))
  lines.push(`\n\n`)
  return lines
}
