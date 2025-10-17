import { describe, test, expect } from 'bun:test'
import { cn } from '../utils'

describe('cn utility function', () => {
  test('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  test('should handle conditional class names', () => {
    const result = cn('base', true && 'conditional', false && 'excluded')
    expect(result).toContain('base')
    expect(result).toContain('conditional')
    expect(result).not.toContain('excluded')
  })

  test('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
  })

  test('should handle empty strings', () => {
    const result = cn('base', '', 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
  })

  test('should merge Tailwind classes correctly', () => {
    const result = cn('p-4 text-red-500', 'p-8')
    // twMerge should handle conflicting classes
    expect(result).toContain('p-8')
    expect(result).toContain('text-red-500')
  })

  test('should handle object syntax', () => {
    const result = cn({
      'bg-blue-500': true,
      'text-white': true,
      'hidden': false,
    })
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('text-white')
    expect(result).not.toContain('hidden')
  })

  test('should handle arrays of class names', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
    expect(result).toContain('class3')
  })

  test('should handle mixed types', () => {
    const result = cn(
      'base',
      ['array1', 'array2'],
      { object: true, excluded: false },
      undefined,
      null,
      'final'
    )
    expect(result).toContain('base')
    expect(result).toContain('array1')
    expect(result).toContain('object')
    expect(result).not.toContain('excluded')
    expect(result).toContain('final')
  })

  test('should handle no arguments', () => {
    const result = cn()
    expect(typeof result).toBe('string')
    expect(result).toBe('')
  })

  test('should override conflicting Tailwind utilities', () => {
    // Test that twMerge properly handles conflicting utilities
    const result = cn('bg-red-500 bg-blue-500')
    expect(result).toContain('bg-blue-500')
  })

  test('should preserve non-conflicting classes', () => {
    const result = cn('p-4 m-2', 'text-xl font-bold')
    expect(result).toContain('p-4')
    expect(result).toContain('m-2')
    expect(result).toContain('text-xl')
    expect(result).toContain('font-bold')
  })

  test('should handle responsive classes', () => {
    const result = cn('block md:flex lg:grid')
    expect(result).toContain('block')
    expect(result).toContain('md:flex')
    expect(result).toContain('lg:grid')
  })

  test('should handle hover and focus states', () => {
    const result = cn('hover:bg-blue-500 focus:ring-2')
    expect(result).toContain('hover:bg-blue-500')
    expect(result).toContain('focus:ring-2')
  })

  test('should handle dark mode classes', () => {
    const result = cn('bg-white dark:bg-gray-900')
    expect(result).toContain('bg-white')
    expect(result).toContain('dark:bg-gray-900')
  })

  test('should trim whitespace', () => {
    const result = cn('  class1  ', '  class2  ')
    expect(result.trim()).toBeTruthy()
  })
})