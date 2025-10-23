export * from './arithmetic'
import * as arithmetic from './arithmetic'

// Programmatically collect all tools from different modules
export const availableTools = {
  ...arithmetic,
  // Add more tool modules here as they're created
}

// Get list of all tool names
export const toolNames = Object.keys(availableTools)
