export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Buzz8n API',
    version: '1.0.0',
    description: 'HTTP API for auth, credentials, workflows, executions, and webhooks.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'buzz8n_auth',
      },
      webhookSecret: {
        type: 'http',
        scheme: 'bearer',
        description: 'Optional webhook secret as Bearer token',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: {},
        },
      },
      HealthStatus: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          checks: {
            type: 'object',
            additionalProperties: { type: 'string', enum: ['ok', 'error'] },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/HealthStatus' } },
            },
          },
        },
      },
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Process live check',
        responses: { '200': { description: 'Live' } },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness (database + redis)',
        responses: {
          '200': { description: 'Ready' },
          '503': { description: 'Not ready' },
        },
      },
    },
    '/api/v1/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Sign up',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'name', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Signed up successfully' },
          '409': {
            description: 'Email already taken',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '422': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Signed in; sets auth cookie' },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/signout': {
      post: {
        tags: ['Auth'],
        summary: 'Sign out',
        responses: {
          '200': { description: 'Signed out; clears auth cookie' },
        },
      },
    },
    '/api/v1/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Current user profile' },
          '401': { description: 'Not authenticated' },
          '404': {
            description: 'User not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/credential': {
      get: {
        tags: ['Credentials'],
        summary: 'List credentials',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated credentials' },
          '401': { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Credentials'],
        summary: 'Create credential',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Credential created' },
          '409': {
            description: 'Title taken',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '422': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
      delete: {
        tags: ['Credentials'],
        summary: 'Soft-delete credential',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Credential archived' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/workflow': {
      get: {
        tags: ['Workflows'],
        summary: 'List workflows',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated non-archived workflows' },
          '401': { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Workflows'],
        summary: 'Create workflow',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Workflow created' },
          '422': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/workflow/{id}': {
      get: {
        tags: ['Workflows'],
        summary: 'Get workflow',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Workflow' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
      put: {
        tags: ['Workflows'],
        summary: 'Update workflow',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Workflow updated' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '422': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
      delete: {
        tags: ['Workflows'],
        summary: 'Soft-delete workflow (sets archived: true)',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Workflow archived' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/workflow/{id}/execute': {
      post: {
        tags: ['Workflows'],
        summary: 'Enqueue manual execution',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '202': { description: 'Execution accepted' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '409': {
            description: 'Workflow inactive',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/workflow/{id}/executions': {
      get: {
        tags: ['Workflows'],
        summary: 'List executions for a workflow',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated executions' },
        },
      },
    },
    '/api/v1/execution': {
      get: {
        tags: ['Executions'],
        summary: 'List executions',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Paginated executions' },
        },
      },
    },
    '/api/v1/execution/{executionId}': {
      get: {
        tags: ['Executions'],
        summary: 'Get execution',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'executionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Execution' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/rate-limits/status': {
      get: {
        tags: ['Rate limits'],
        summary: 'Rate limit status for current user',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Rate limit status' },
        },
      },
    },
    '/webhook/{webhookPath}': {
      post: {
        tags: ['Webhook'],
        summary: 'Trigger workflow via webhook',
        parameters: [
          { name: 'webhookPath', in: 'path', required: true, schema: { type: 'string' } },
        ],
        security: [{ webhookSecret: [] }],
        responses: {
          '202': { description: 'Execution accepted' },
          '403': {
            description: 'Invalid secret',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '404': {
            description: 'Invalid request',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          '409': {
            description: 'Workflow inactive',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
  },
} as const

export const openApiDocsHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Buzz8n API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/v1/openapi.json',
        dom_id: '#swagger-ui',
      });
    </script>
  </body>
</html>`
