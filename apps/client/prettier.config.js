//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',

  sortingmethod: 'linelength',
  sortingorder: 'ascending',
  plugins: ['prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
}

export default config
