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
import { aiAgentFormSchema, type AiAgentFormData } from '@buzz8n/common/types'
import { clientConfig } from '@buzz8n/common/utils/config-loader'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'
import { exponent, multiply, sum } from './tools'
import { renderTemplate } from '@/nodes/helper'
import { ChatOpenAI } from '@langchain/openai'
import type { ExecContext } from '@/nodes'
import { prisma } from '@buzz8n/store/'
import { createAgent } from 'langchain'
import { logger } from '@/utils'
import Mustache from 'mustache'

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

    if (!success || !prompt || !model) {
      throw new Error('Invalid credential data')
    }

    // Render template in prompt
    const resolvedPrompt = renderTemplate(prompt, context)

    // Log for debugging
    logger.info('AI Agent config', {
      raw: { prompt, model },
      resolved: { prompt: resolvedPrompt, model },
    })

    const selectedModel = getModel(model, data)

    const agent = createReactAgent({
      llm: selectedModel,
      tools: [sum, multiply, exponent],
    })

    const { messages } = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: resolvedPrompt,
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
