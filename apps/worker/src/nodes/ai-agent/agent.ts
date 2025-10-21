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

//TODO: Fix the deprecation warnings for the createReactAgent function use createAgent from langchain instead
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { aiAgentFormSchema } from '@buzz8n/common/types'
import { ChatAnthropic } from '@langchain/anthropic'
import { exponent, multiply, sum } from './tools'
import { ChatOpenAI } from '@langchain/openai'
import type { ExecContext } from '@/nodes'
import { prisma } from '@buzz8n/store/'
import { createAgent } from 'langchain'
import { logger } from '@/utils'

// Initialize the model with tools

const getModel = (model: string, apiKey: string) => {
  switch (model) {
    case 'gemini-2.5-flash' || 'gemini-2.5-flash-lite' || 'gemini-2.5-pro':
      return new ChatGoogleGenerativeAI({
        apiKey,
        model,
        temperature: 0,
      })
    case 'gpt-4' || 'gpt-4o' || 'gpt-4o-mini' || 'gpt-5':
      return new ChatOpenAI({
        model,
        temperature: 0,
      })
    case 'claude-3-5-sonnet' ||
      'claude-3-5-haiku' ||
      'claude-3-opus' ||
      'claude-4-sonnet' ||
      'claude-4-haiku' ||
      'claude-4-opus':
      return new ChatAnthropic({
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
      throw new Error('Credentials to execute sendTelegram Message not provided')
    }

    const credential = await prisma.credential.findUnique({
      where: {
        id: credentialId,
      },
    })
    if (!credential || !credential.data) {
      throw new Error('Credential to execute sendTelegram Message does not exists')
    }
    const { data, success } = aiAgentFormSchema.safeParse(credential.data)

    const { prompt, model } = config as { prompt: string; model: string }

    console.log('data', data, prompt, model)
    if (!success || !prompt || !model) {
      throw new Error('Invalid credential data')
    }

    const { platform } = data
    let selectedModel = null
    switch (platform) {
      case 'gemini':
        selectedModel = getModel(model, data.geminiApiKey)
        break
      case 'anthropic':
        selectedModel = getModel(model, data.anthropicApiKey)
        break
      case 'openai':
        selectedModel = getModel(model, data.openaiApiKey)
        break
    }

    const agent = createReactAgent({
      llm: selectedModel,
      tools: [sum, multiply, exponent],
    })

    const { messages } = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // const resp = await structuredResponse.toJSON()
    logger.info('AI Agent response', messages)
    return { status: 'ok', data: messages }
  } catch (error) {
    logger.error('Failed to invoke AI Agent', error)
    return { status: 'error', data: error }
  }
}
