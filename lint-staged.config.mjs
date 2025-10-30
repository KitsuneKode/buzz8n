/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  // TypeScript/JavaScript files in apps and packages
  '(apps|packages)/**/*.{js,ts,jsx,tsx}': (files) => {
    const commands = [
      // ESLint with auto-fix
      // eslint-disable-next-line turbo/no-undeclared-env-vars, no-undef
      process.env.SKIP_WARNINGS === '1'
        ? `eslint --fix ${files.join(' ')}`
        : `eslint --fix --max-warnings=0 ${files.join(' ')}`,
    ]
    return commands
  },

  // Prettier for all supported file types
  '**/{*.json,*.md,*.yml,*.yaml}': ['prettier --write'],
  // Prisma schema formatting
  'packages/store/prisma/schema.prisma': (file) => [`prisma format --schema ${file}`],
}
