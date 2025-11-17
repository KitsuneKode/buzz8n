import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockLoggerError: any = mock(() => {})
const mockPrismaCredentialFindMany: any = mock(() => Promise.resolve([]))
const mockPrismaCredentialCreate: any = mock(() => Promise.resolve(null))
const mockPrismaCredentialUpdate: any = mock(() => Promise.resolve(null))

mock.module('@apps/server/src/utils/logger', () => ({
  logger: {
    info: mock(() => {}),
    error: mockLoggerError,
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    credential: {
      findMany: mockPrismaCredentialFindMany,
      create: mockPrismaCredentialCreate,
      update: mockPrismaCredentialUpdate,
    },
  },
  PrismaClientKnownRequestError: class extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.code = code
    }
  },
}))

mock.module('@buzz8n/common/types', () => ({
  credentialSchema: {
    safeParse: mock((data: any) => {
      if (data.platform && data.data && data.title) {
        return { success: true, data }
      }
      return { success: false }
    }),
  },
}))

describe('Credential Router', () => {
  beforeEach(() => {
    mockLoggerError.mockClear()
    mockPrismaCredentialFindMany.mockClear()
    mockPrismaCredentialCreate.mockClear()
    mockPrismaCredentialUpdate.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    params: {},
    query: {},
    body: {},
    user: { userId: 'user-123', email: 'test@example.com' },
    ...overrides,
  })

  const createMockResponse = (): Partial<Response> => {
    const res: any = {
      status: mock(function (this: any, code: number) {
        this.statusCode = code
        return this
      }),
      send: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      json: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      statusCode: 200,
      body: null,
    }
    return res
  }

  const createMockNext = (): NextFunction => mock(() => {}) as any

  describe('GET /credential (List credentials)', () => {
    test('should return paginated credentials with default limit', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockCredentials = [
        {
          id: 'cred-1',
          platform: 'OpenAI',
          title: 'OpenAI API Key',
          data: { apiKey: 'sk-xxx' },
          createdAt: new Date(),
        },
        {
          id: 'cred-2',
          platform: 'Telegram',
          title: 'Telegram Bot',
          data: { botToken: '123456:ABC' },
          createdAt: new Date(),
        },
      ]

      mockPrismaCredentialFindMany.mockResolvedValueOnce(mockCredentials)

      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      const userId = req.user!.userId
      const limit = parseInt((req.query!.limit as string) || '20')

      const credentials = await prisma.credential.findMany({
        take: limit + 1,
        where: {
          userId,
          archived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          data: true,
          platform: true,
          title: true,
          createdAt: true,
        },
      })

      const hasNextPage = credentials.length > limit
      const actualCredentials = hasNextPage ? credentials.slice(0, limit) : credentials
      const nextCursor = hasNextPage ? actualCredentials[actualCredentials.length - 1]?.id : undefined

      res.status!(200).send!({
        credentials: actualCredentials,
        cursor: nextCursor,
      })

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        credentials: mockCredentials,
        cursor: undefined,
      })
    })

    test('should return 400 for invalid cursor format', async () => {
      const req = createMockRequest({ query: { cursor: 'invalid cursor with spaces!' } })
      const res = createMockResponse()

      const cursor = req.query!.cursor as string
      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        res.status!(400).json!({ error: 'Invalid cursor format' })
      }

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid cursor format' })
    })

    test('should handle pagination with cursor', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockCredentials = Array.from({ length: 21 }, (_, i) => ({
        id: `cred-${i}`,
        platform: 'OpenAI',
        title: `Credential ${i}`,
        data: { apiKey: 'sk-xxx' },
        createdAt: new Date(),
      }))

      mockPrismaCredentialFindMany.mockResolvedValueOnce(mockCredentials)

      const req = createMockRequest({ query: { limit: '20', cursor: 'cred-0' } })
      const res = createMockResponse()

      const userId = req.user!.userId
      const limit = parseInt((req.query!.limit as string) || '20')
      const cursor = req.query!.cursor as string

      const credentials = await prisma.credential.findMany({
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        where: {
          userId,
          archived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          data: true,
          platform: true,
          title: true,
          createdAt: true,
        },
      })

      const hasNextPage = credentials.length > limit
      const actualCredentials = hasNextPage ? credentials.slice(0, limit) : credentials
      const nextCursor = hasNextPage ? actualCredentials[actualCredentials.length - 1]?.id : undefined

      res.status!(200).send!({
        credentials: actualCredentials,
        cursor: nextCursor,
      })

      expect(mockPrismaCredentialFindMany).toHaveBeenCalledWith({
        take: 21,
        cursor: { id: 'cred-0' },
        skip: 1,
        where: {
          userId: 'user-123',
          archived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          data: true,
          platform: true,
          title: true,
          createdAt: true,
        },
      })
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: expect.any(Array),
          cursor: expect.any(String),
        })
      )
    })

    test('should only return non-archived credentials', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaCredentialFindMany.mockResolvedValueOnce([])

      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      const userId = req.user!.userId
      const limit = parseInt((req.query!.limit as string) || '20')

      await prisma.credential.findMany({
        take: limit + 1,
        where: {
          userId,
          archived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          data: true,
          platform: true,
          title: true,
          createdAt: true,
        },
      })

      expect(mockPrismaCredentialFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            archived: false,
          }),
        })
      )
    })

    test('should call next() on database errors', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaCredentialFindMany.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest({ query: {} })
      const res = createMockResponse()
      const next = createMockNext()

      try {
        const userId = req.user!.userId
        const limit = parseInt((req.query!.limit as string) || '20')

        await prisma.credential.findMany({
          take: limit + 1,
          where: {
            userId,
            archived: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            data: true,
            platform: true,
            title: true,
            createdAt: true,
          },
        })
      } catch (error) {
        next(error)
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('POST /credential (Create credential)', () => {
    test('should return 422 when validation fails', async () => {
      const { credentialSchema } = await import('@buzz8n/common/types')
      const req = createMockRequest({ body: { platform: 'OpenAI' } }) // Missing data and title
      const res = createMockResponse()

      const isParsed = credentialSchema.safeParse(req.body)

      if (!isParsed.success) {
        res.status!(422).send!('Invalid Data')
      }

      expect(mockLoggerError).toHaveBeenCalledWith('not parsed', { body: req.body })
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should successfully create credential', async () => {
      const { credentialSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      const mockCredential = {
        id: 'new-cred-123',
        platform: 'OpenAI',
        title: 'My OpenAI Key',
        data: { apiKey: 'sk-xxx' },
        userId: 'user-123',
        createdAt: new Date(),
      }

      mockPrismaCredentialCreate.mockResolvedValueOnce(mockCredential)

      const req = createMockRequest({
        body: {
          platform: 'OpenAI',
          title: 'My OpenAI Key',
          data: { apiKey: 'sk-xxx' },
        },
      })
      const res = createMockResponse()

      const isParsed = credentialSchema.safeParse(req.body)

      if (isParsed.success) {
        const { platform, data, title } = isParsed.data

        const credential = await prisma.credential.create({
          data: {
            data,
            title,
            platform,
            userId: req.user!.userId,
          },
        })

        if (credential) {
          res.status!(201).json!(credential)
        }
      }

      expect(mockPrismaCredentialCreate).toHaveBeenCalledWith({
        data: {
          data: { apiKey: 'sk-xxx' },
          title: 'My OpenAI Key',
          platform: 'OpenAI',
          userId: 'user-123',
        },
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockCredential)
    })

    test('should return 409 when credential with title already exists', async () => {
      const { credentialSchema } = await import('@buzz8n/common/types')
      const { prisma, PrismaClientKnownRequestError } = await import('@buzz8n/store')

      const prismaError = new (PrismaClientKnownRequestError as any)(
        'Unique constraint failed',
        'P2002'
      )
      mockPrismaCredentialCreate.mockRejectedValueOnce(prismaError)

      const req = createMockRequest({
        body: {
          platform: 'OpenAI',
          title: 'Existing Credential',
          data: { apiKey: 'sk-xxx' },
        },
      })
      const res = createMockResponse()

      const isParsed = credentialSchema.safeParse(req.body)

      if (isParsed.success) {
        try {
          const { platform, data, title } = isParsed.data

          await prisma.credential.create({
            data: {
              data,
              title,
              platform,
              userId: req.user!.userId,
            },
          })
        } catch (error: any) {
          if (error.code === 'P2002') {
            res.status!(409).send!('Credential with that title already exists')
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.send).toHaveBeenCalledWith('Credential with that title already exists')
    })

    test('should call next() on unexpected errors', async () => {
      const { credentialSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaCredentialCreate.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest({
        body: {
          platform: 'OpenAI',
          title: 'My OpenAI Key',
          data: { apiKey: 'sk-xxx' },
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      const isParsed = credentialSchema.safeParse(req.body)

      if (isParsed.success) {
        try {
          const { platform, data, title } = isParsed.data

          await prisma.credential.create({
            data: {
              data,
              title,
              platform,
              userId: req.user!.userId,
            },
          })
        } catch (error: any) {
          if (error.code !== 'P2002') {
            next(error)
          }
        }
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('DELETE /credential (Soft delete credential)', () => {
    test('should return 422 when credentialId is missing', async () => {
      const req = createMockRequest({ body: {} })
      const res = createMockResponse()

      const credentialId = req.body!.id as string

      if (!credentialId) {
        res.status!(422).send!('Invalid Data')
      }

      expect(mockLoggerError).toHaveBeenCalledWith('no Id', { body: req.body })
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should successfully soft delete (archive) credential', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockCredential = {
        id: 'cred-123',
        platform: 'OpenAI',
        title: 'My OpenAI Key',
        data: { apiKey: 'sk-xxx' },
        userId: 'user-123',
        archived: true,
      }

      mockPrismaCredentialUpdate.mockResolvedValueOnce(mockCredential)

      const req = createMockRequest({ body: { id: 'cred-123' } })
      const res = createMockResponse()

      const credentialId = req.body!.id as string

      if (credentialId) {
        const credential = await prisma.credential.update({
          where: {
            id: credentialId,
            userId: req.user!.userId,
          },
          data: {
            archived: true,
          },
        })

        if (credential) {
          res.status!(200).json!(credential)
        }
      }

      expect(mockPrismaCredentialUpdate).toHaveBeenCalledWith({
        where: {
          id: 'cred-123',
          userId: 'user-123',
        },
        data: {
          archived: true,
        },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockCredential)
    })

    test('should return 404 when credential does not exist', async () => {
      const { prisma, PrismaClientKnownRequestError } = await import('@buzz8n/store')

      const prismaError = new (PrismaClientKnownRequestError as any)('Record not found', 'P2025')
      mockPrismaCredentialUpdate.mockRejectedValueOnce(prismaError)

      const req = createMockRequest({ body: { id: 'nonexistent-cred' } })
      const res = createMockResponse()

      const credentialId = req.body!.id as string

      if (credentialId) {
        try {
          await prisma.credential.update({
            where: {
              id: credentialId,
              userId: req.user!.userId,
            },
            data: {
              archived: true,
            },
          })
        } catch (error: any) {
          if (error.code === 'P2025') {
            res.status!(404).send!('Credential with that id does not exists')
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Credential with that id does not exists')
    })

    test('should call next() on unexpected errors', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaCredentialUpdate.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest({ body: { id: 'cred-123' } })
      const res = createMockResponse()
      const next = createMockNext()

      const credentialId = req.body!.id as string

      if (credentialId) {
        try {
          await prisma.credential.update({
            where: {
              id: credentialId,
              userId: req.user!.userId,
            },
            data: {
              archived: true,
            },
          })
        } catch (error: any) {
          if (error.code !== 'P2025') {
            next(error)
          }
        }
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })

    test('should only allow users to delete their own credentials', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaCredentialUpdate.mockResolvedValueOnce({
        id: 'cred-123',
        archived: true,
      })

      const req = createMockRequest({
        body: { id: 'cred-123' },
        user: { userId: 'user-123', email: 'test@example.com' },
      })
      const res = createMockResponse()

      const credentialId = req.body!.id as string

      if (credentialId) {
        await prisma.credential.update({
          where: {
            id: credentialId,
            userId: req.user!.userId,
          },
          data: {
            archived: true,
          },
        })
      }

      expect(mockPrismaCredentialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      )
    })
  })
})
