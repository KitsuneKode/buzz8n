/**
 * This file contains the implementation of the AI Agent node.
 *
 *
 *
 * @param config - The configuration for the AI Agent node.
 * @param credentialId - The ID of the credential to use for the AI Agent node.
 * @param context - The context of the AI Agent node.
 * @returns The response from the AI Agent node.
 */
import { aiAgentFormSchema, type AiAgentFormData } from '@buzz8n/common/types'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { loadCredentialData } from '@/nodes/load-credential'
import { HumanMessage, createAgent } from 'langchain'
import { ChatAnthropic } from '@langchain/anthropic'
import { renderTemplate } from '@/nodes/helper'
import { ChatOpenAI } from '@langchain/openai'
import type { ExecContext } from '@/nodes'
import { availableTools } from './tools'
import { logger } from '@/utils'
import { z } from 'zod'

// Initialize the model with tools

const getModel = (model: string, data: AiAgentFormData) => {
  switch (data.platform) {
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        apiKey: data.geminiApiKey,
        model,
        temperature: 0,
      })
    case 'openai':
      return new ChatOpenAI({
        apiKey: data.openaiApiKey,
        model,
        temperature: 0,
      })
    case 'anthropic':
      return new ChatAnthropic({
        apiKey: data.anthropicApiKey,
        model,
        temperature: 0,
      })
    default:
      throw new Error(`Model ${model} not supported`)
  }
}

export const runAiAgent = async (
  config: Record<string, unknown> | undefined,
  credentialId: string | undefined,
  context: ExecContext,
) => {
  try {
    if (!credentialId || typeof config !== 'object') {
      logger.warn('AI Agent: Missing credentials or invalid config', { credentialId, config })
      throw new Error('Credentials to execute AI Agent not provided')
    }

    const plain = await loadCredentialData(credentialId, context.userId)
    const { data, success } = aiAgentFormSchema.safeParse(plain)

    const { prompt, model, allowedTools } = config as {
      prompt: string
      model: string
      allowedTools:
        | { type: string; label: string; config: Record<string, unknown>; id: string }[]
        | undefined
    }

    // Render template in prompt
    const resolvedPrompt = renderTemplate(prompt, context)
    if (!success || !resolvedPrompt || !model) {
      logger.warn('AI Agent: Invalid credential data or config', { success, prompt, model })
      throw new Error('Invalid credential data')
    }
    logger.info('AI Agent config', {
      model,
      promptLength: resolvedPrompt.length,
      toolCount: allowedTools?.length ?? 0,
    })
    const selectedModel = getModel(model, data)

    const responseFormat = z.object({
      response_from_agent: z.string().describe('The response from the agent'),
    })

    // Programmatically select tools based on allowedTools config
    // If allowedTools is undefined or empty, use no tool
    const selectedToolNames =
      allowedTools && allowedTools.length > 0 ? allowedTools?.map((tool) => tool.type) : undefined

    const tools = selectedToolNames
      ?.filter((toolName) => toolName in availableTools)
      ?.map((toolName) => availableTools[toolName as keyof typeof availableTools])

    const systemPrompt = `
    You are a helpful assistant that will help the user to complete the task
    ${tools && tools.length > 0 && 'You can use the following tools to help the user:'}
    ${tools && tools.length > 0 && selectedToolNames?.map((tool) => `- ${tool}`).join('\n')}
    `

    const agent = createAgent({
      model: selectedModel,
      tools: tools && tools.length > 0 ? tools : undefined,
      responseFormat,
      systemPrompt,
    })

    const userPrompt = new HumanMessage(resolvedPrompt)

    const { structuredResponse } = await agent.invoke({
      messages: [userPrompt],
    })

    logger.info('AI Agent response', { response: structuredResponse.response_from_agent })
    return { status: 'ok', data: { response: structuredResponse.response_from_agent } }
  } catch (error) {
    logger.error('Failed to invoke AI Agent', error)
    throw error
  }
}
