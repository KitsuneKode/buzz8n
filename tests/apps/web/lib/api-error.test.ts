import { describe, expect, test } from 'bun:test'
import { AxiosError } from 'axios'
import { getApiErrorMessage } from '../../../../apps/web/lib/api-error'

function axiosError(data: unknown): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    response: {
      data,
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    },
    toJSON: () => ({}),
  } as AxiosError
}

describe('getApiErrorMessage', () => {
  test('reads legacy string bodies', () => {
    expect(getApiErrorMessage(axiosError('plain failure'), 'fallback')).toBe('plain failure')
  })

  test('reads JSON error and message fields', () => {
    expect(getApiErrorMessage(axiosError({ error: 'nope' }), 'fallback')).toBe('nope')
    expect(getApiErrorMessage(axiosError({ message: 'done' }), 'fallback')).toBe('done')
  })

  test('falls back when body is empty or unknown', () => {
    expect(getApiErrorMessage(axiosError(null), 'fallback')).toBe('fallback')
    expect(getApiErrorMessage(axiosError({}), 'fallback')).toBe('fallback')
  })
})
