import { tool } from '@langchain/core/tools'

import { z } from 'zod'

import { logger } from '@/utils'

export const sum = tool(
  async (input) => {
    logger.debug('sum tool called')
    return input.a + input.b
  },
  {
    name: 'sum',
    description: 'Call to sum two numbers.',
    schema: z.object({
      a: z.number().describe('The first number to add.'),
      b: z.number().describe('The second number to add.'),
    }),
  },
)

export const multiply = tool(
  async (input) => {
    logger.debug('multiply tool called')
    return input.a * input.b
  },
  {
    name: 'multiply',
    description: 'Call to multiply two numbers.',
    schema: z.object({
      a: z.number().describe('The first number to multiply.'),
      b: z.number().describe('The second number to multiply.'),
    }),
  },
)

export const exponent = tool(
  async (input) => {
    logger.debug('exponent tool called')
    return input.a ** input.b
  },
  {
    name: 'exponent',
    description: 'Finds power of a number to a given number.',
    schema: z.object({
      a: z.number().describe('The number to find the power of.'),
      b: z.number().describe('The power to raise the number to.'),
    }),
  },
)
