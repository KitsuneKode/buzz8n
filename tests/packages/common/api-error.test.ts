import { describe, expect, test } from 'bun:test'
import { apiError } from '../../../packages/common/src/types/api.ts'

describe('apiError helper', () => {
  test('builds error envelope with code and details', () => {
    expect(apiError('Invalid data', { code: 'VALIDATION_ERROR', details: { field: 'email' } })).toEqual({
      error: 'Invalid data',
      code: 'VALIDATION_ERROR',
      details: { field: 'email' },
    })
  })

  test('omits optional fields when not provided', () => {
    expect(apiError('Not found')).toEqual({ error: 'Not found' })
  })
})
