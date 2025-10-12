import { backendLogger } from './logger'

class ConfigLoader<T extends Record<string, any>> {
  private static instanceMap = new Map<string, ConfigLoader<any>>()
  private config: T

  private constructor(schema: { [K in keyof T]: () => T[K] }) {
    this.config = Object.keys(schema).reduce((acc, key) => {
      acc[key as keyof T] = schema[key as keyof T]()
      return acc
    }, {} as T)
  }

  public static getInstance<T extends Record<string, any>>(
    schema: { [K in keyof T]: () => T[K] },
    key: string = 'default', // optional identifier for multi-config support
  ): ConfigLoader<T> {
    if (!ConfigLoader.instanceMap.has(key)) {
      ConfigLoader.instanceMap.set(key, new ConfigLoader(schema))
    }
    return ConfigLoader.instanceMap.get(key) as ConfigLoader<T>
  }

  public getConfig<K extends keyof T>(key: K): T[K] {
    return this.config[key]
  }

  public validate(requiredKeys: (keyof T)[]): void {
    const errors: string[] = []
    requiredKeys.forEach((key) => {
      const value = this.config[key]
      if (value === undefined || value === null) {
        errors.push(`${String(key)} is required but not provided`)
      }
    })
    if (errors.length > 0) {
      const notAvailableENVs = errors.reduce((prev, curr) => (prev = `${prev} \n ${curr}`), '')

      backendLogger.error(
        `Configuration validation failed:\n Configuration keys ${notAvailableENVs}`,
      )
      process.exit(1)
    }
  }

  public validateAll(): void {
    this.validate(Object.keys(this.config) as (keyof T)[])
  }

  public getAllConfigs(): T {
    return this.config
  }
}

const backendConfigSchema = {
  environment: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  allowedOrigins: () => process.env.ALLOWED_ORIGINS,
  redisUrl: () => process.env.REDIS_URL,
}

export const backendConfig = ConfigLoader.getInstance(backendConfigSchema, 'server')

const clientConfigSchema = {
  apiUrl: () => process.env.NEXT_PUBLIC_API_URL,
  environment: () => process.env.NODE_ENV,
}

export const clientConfig = ConfigLoader.getInstance(clientConfigSchema, 'client')
