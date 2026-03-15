const userRoles = ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const
const transactionStatuses = ['pending', 'paid', 'failed', 'refunded'] as const

type OpenApiDocument = Record<string, unknown>

export function getOpenApiDocument(): OpenApiDocument {
  return {
    openapi: '3.1.0',
    info: {
      title: 'BeTalent Payments API',
      version: '1.0.0',
      description:
        'API para gerenciamento de usuários, produtos, clientes, transações e gateways de pagamento.',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Base URL da API',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Registro, login e logout' },
      { name: 'Profile', description: 'Perfil do usuário autenticado' },
      { name: 'Users', description: 'Gestão de usuários' },
      { name: 'Products', description: 'Gestão de produtos' },
      { name: 'Gateways', description: 'Gestão de gateways de pagamento' },
      { name: 'Clients', description: 'Consulta de clientes' },
      { name: 'Transactions', description: 'Compras, listagem e reembolsos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorMessage: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Resource not found' },
          },
          required: ['message'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation failure' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  rule: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'The email field must be a valid email address' },
                },
              },
            },
          },
          required: ['message'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ana Costa' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            role: { type: 'string', enum: [...userRoles], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'email', 'role'],
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ana Costa' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
          },
          required: ['id', 'name', 'email'],
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ana Costa' },
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            password: { type: 'string', minLength: 8, maxLength: 32, example: 'password123' },
          },
          required: ['name', 'email', 'password'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'ana@example.com' },
            password: { type: 'string', example: 'password123' },
          },
          required: ['email', 'password'],
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
          required: ['token', 'refreshToken', 'user'],
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Carlos Souza' },
            email: { type: 'string', format: 'email', example: 'carlos@example.com' },
            password: { type: 'string', minLength: 8, maxLength: 32, example: 'password123' },
            role: { type: 'string', enum: [...userRoles], example: 'FINANCE' },
          },
          required: ['name', 'email', 'password', 'role'],
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Carlos Souza' },
            email: { type: 'string', format: 'email', example: 'carlos@example.com' },
            password: { type: 'string', minLength: 8, maxLength: 32, example: 'newpassword123' },
            role: { type: 'string', enum: [...userRoles], example: 'MANAGER' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Camiseta BeTalent' },
            amount: { type: 'integer', example: 4990, description: 'Valor em centavos' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: ['string', 'null'], format: 'date-time' },
          },
          required: ['id', 'name', 'amount'],
        },
        CreateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Camiseta BeTalent' },
            amount: { type: 'integer', minimum: 1, example: 4990, description: 'Valor em centavos' },
          },
          required: ['name', 'amount'],
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Camiseta BeTalent Premium' },
            amount: { type: 'integer', minimum: 1, example: 5990, description: 'Valor em centavos' },
          },
        },
        Gateway: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Gateway1' },
            isActive: { type: 'boolean', example: true },
            priority: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'isActive', 'priority'],
        },
        UpdateGatewayRequest: {
          type: 'object',
          properties: {
            isActive: { type: 'boolean', example: false },
            priority: { type: 'integer', minimum: 0, example: 2 },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Maria Santos' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'email'],
        },
        TransactionProduct: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            transactionId: { type: 'integer', example: 10 },
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            unitAmount: { type: 'integer', example: 4990, description: 'Valor unitário em centavos' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            product: { $ref: '#/components/schemas/Product' },
          },
          required: ['id', 'transactionId', 'productId', 'quantity', 'unitAmount'],
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            clientId: { type: 'integer', example: 1 },
            gatewayId: { type: 'integer', example: 1 },
            externalId: { type: 'string', example: 'ext_123456' },
            status: { type: 'string', enum: [...transactionStatuses], example: 'paid' },
            amount: { type: 'integer', example: 9980, description: 'Valor total em centavos' },
            cardLastNumbers: { type: ['string', 'null'], example: '6063' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            client: { $ref: '#/components/schemas/Client' },
            gateway: { $ref: '#/components/schemas/Gateway' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/TransactionProduct' },
            },
          },
          required: ['id', 'clientId', 'gatewayId', 'externalId', 'status', 'amount'],
        },
        ClientDetail: {
          allOf: [
            { $ref: '#/components/schemas/Client' },
            {
              type: 'object',
              properties: {
                transactions: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Transaction' },
                },
              },
            },
          ],
        },
        PurchaseRequest: {
          type: 'object',
          properties: {
            client: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Maria Santos' },
                email: { type: 'string', format: 'email', example: 'maria@example.com' },
              },
              required: ['name', 'email'],
            },
            products: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer', minimum: 1, example: 1 },
                  quantity: { type: 'integer', minimum: 1, example: 2 },
                },
                required: ['id', 'quantity'],
              },
            },
            card: {
              type: 'object',
              properties: {
                number: {
                  type: 'string',
                  minLength: 16,
                  maxLength: 16,
                  example: '5569000000006063',
                },
                cvv: { type: 'string', minLength: 3, maxLength: 4, example: '010' },
              },
              required: ['number', 'cvv'],
            },
          },
          required: ['client', 'products', 'card'],
        },
      },
      responses: {
        Unauthorized: {
          description: 'Autenticação obrigatória',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorMessage' },
              example: { message: 'Unauthorized access' },
            },
          },
        },
        Forbidden: {
          description: 'Permissão insuficiente',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorMessage' },
              example: { message: 'Access denied' },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorMessage' },
            },
          },
        },
        Validation: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Usuário criado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autenticar usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            '400': {
              description: 'Credenciais inválidas',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/ErrorMessage' }],
                  },
                  example: 'Invalid credentials',
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Revogar sessão atual',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Logout realizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Logged out successfully' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/account/profile': {
        get: {
          tags: ['Profile'],
          summary: 'Consultar perfil autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Perfil do usuário',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Profile' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar usuários',
          description: 'Disponível para roles ADMIN e MANAGER.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de usuários',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Criar usuário',
          description: 'Disponível para roles ADMIN e MANAGER.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Usuário criado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Detalhar usuário',
          description: 'Disponível para roles ADMIN e MANAGER.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Usuário encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Atualizar usuário',
          description: 'Disponível para roles ADMIN e MANAGER.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Usuário atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Remover usuário',
          description: 'Disponível para roles ADMIN e MANAGER.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Usuário removido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'User deleted successfully' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'Listar produtos',
          description: 'Disponível para roles ADMIN, MANAGER e FINANCE.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de produtos ativos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Criar produto',
          description: 'Disponível para roles ADMIN, MANAGER e FINANCE.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProductRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Produto criado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
      },
      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Detalhar produto',
          description: 'Disponível para roles ADMIN, MANAGER e FINANCE.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Produto encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Atualizar produto',
          description: 'Disponível para roles ADMIN, MANAGER e FINANCE.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProductRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Produto atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Remover produto',
          description: 'Soft delete. Disponível para roles ADMIN, MANAGER e FINANCE.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Produto removido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  example: { message: 'Product deleted successfully' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/gateways': {
        get: {
          tags: ['Gateways'],
          summary: 'Listar gateways',
          description: 'Disponível apenas para role ADMIN.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de gateways',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Gateway' },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
      '/gateways/{id}': {
        patch: {
          tags: ['Gateways'],
          summary: 'Atualizar gateway',
          description: 'Ativa/desativa gateway ou altera prioridade. Disponível apenas para role ADMIN.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateGatewayRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Gateway atualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Gateway' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '422': { $ref: '#/components/responses/Validation' },
          },
        },
      },
      '/clients': {
        get: {
          tags: ['Clients'],
          summary: 'Listar clientes',
          description: 'Disponível para qualquer usuário autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de clientes',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Client' },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/clients/{id}': {
        get: {
          tags: ['Clients'],
          summary: 'Detalhar cliente',
          description: 'Retorna o cliente e o histórico de compras. Disponível para qualquer usuário autenticado.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Cliente encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ClientDetail' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'Listar transações',
          description: 'Disponível para qualquer usuário autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de transações',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Transaction' },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Detalhar transação',
          description: 'Disponível para qualquer usuário autenticado.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Transação encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Transaction' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '404': { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/transactions/purchase': {
        post: {
          tags: ['Transactions'],
          summary: 'Realizar compra',
          description:
            'Endpoint público. Calcula o total no back-end, tenta cobrança via gateways ativos e persiste a transação.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PurchaseRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Compra concluída',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Transaction' },
                },
              },
            },
            '422': {
              description: 'Erro de validação ou produto indisponível',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      { $ref: '#/components/schemas/ValidationError' },
                      { $ref: '#/components/schemas/ErrorMessage' },
                    ],
                  },
                  examples: {
                    validation: {
                      value: {
                        message: 'Validation failure',
                        errors: [
                          {
                            field: 'products',
                            rule: 'minLength',
                            message: 'The products field must have at least 1 item',
                          },
                        ],
                      },
                    },
                    unavailableProducts: {
                      value: {
                        message: 'One or more products not found or unavailable',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/transactions/{id}/refund': {
        post: {
          tags: ['Transactions'],
          summary: 'Reembolsar transação',
          description: 'Disponível para roles ADMIN e FINANCE. Apenas transações pagas podem ser reembolsadas.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: 'Transação reembolsada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Transaction' },
                },
              },
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '422': {
              description: 'Transação inválida para reembolso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorMessage' },
                  examples: {
                    alreadyRefunded: {
                      value: { message: 'Transaction is already refunded' },
                    },
                    notPaid: {
                      value: { message: 'Only paid transactions can be refunded' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}

export function getSwaggerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BeTalent API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body {
        margin: 0;
        background: #f5f6f8;
      }

      .topbar {
        display: none;
      }

      .swagger-ui .information-container {
        padding-bottom: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/v1/docs/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
          displayRequestDuration: true,
        })
      }
    </script>
  </body>
</html>`
}
