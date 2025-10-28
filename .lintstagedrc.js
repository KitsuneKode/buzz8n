const SKIP_WARNINGS = process.env.SKIP_WARNINGS
export default {
  // TypeScript/JavaScript files in apps and packages
  '(apps|packages)/**/*.{js,ts,jsx,tsx}': (files) => {
    const commands = [
      // ESLint with auto-fix
      SKIP_WARNINGS === '1'
        ? `eslint --fix ${files.join(' ')}`
        : `eslint --fix --max-warnings=0 ${files.join(' ')}`,
    ]
    return commands
  },

  // Prettier for all supported file types
  '**/{*.json,*.md,*.yml,*.yaml}': ['prettier --write'],
  // Prisma schema formatting
  'packages/store/prisma/schema.prisma': ['prisma format'],
}
