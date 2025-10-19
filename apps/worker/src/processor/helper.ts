import { prisma } from '@buzz8n/store'
import { redis } from '@/redis'

const INACTIVITY_TIMEOUT = 1 * 60 * 60 //1h
const workflowKey = (id: string) => `workflow:${id}:active_count`

/**
 * Increment active executions counter, refresh TTL, flip status to 'active' on first.
 */
export async function beginExecutionSetStatus(workflowId: string): Promise<number> {
  const WORKFLOW_ACTIVE_COUNT_KEY = workflowKey(workflowId)
  const count = await redis.incr(WORKFLOW_ACTIVE_COUNT_KEY) // creates WORKFLOW_ACTIVE_COUNT_KEY if missing, returns new value
  await redis.expire(WORKFLOW_ACTIVE_COUNT_KEY, INACTIVITY_TIMEOUT) // refresh inactivity window
  if (count === 1) {
    await prisma.workflow.update({ where: { id: workflowId }, data: { active: true } })
  }
  return count
}

/**
 * Decrement counter, refresh TTL, flip status to 'inactive' when it reaches zero.
 * Cleans up if the counter somehow goes negative.
 */
export async function endExecutionSetStatus(workflowId: string): Promise<number> {
  const WORKFLOW_ACTIVE_COUNT_KEY = workflowKey(workflowId)
  const count = await redis.decr(WORKFLOW_ACTIVE_COUNT_KEY) // returns new value after decrement
  await redis.expire(WORKFLOW_ACTIVE_COUNT_KEY, INACTIVITY_TIMEOUT) // keep only inactive keys expiring
  if (count === 0) {
    await prisma.workflow.update({ where: { id: workflowId }, data: { active: false } })
  }
  if (count < 0) {
    await redis.del(WORKFLOW_ACTIVE_COUNT_KEY)
    await prisma.workflow.update({ where: { id: workflowId }, data: { active: false } })
  }
  return count
}

/**
 * Creates a simple ASCII snapshot of th
 * - sources: indegree-0 nodes
 * - layers: Kahn-style levels (waves)
 * - edges: "U -> [V1, V2]" per node
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
