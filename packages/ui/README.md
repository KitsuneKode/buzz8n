# @buzz8n/ui

Shared shadcn/ui + Radix component library for buzz8n (Tailwind v4, OKLCH tokens).

## Usage

```tsx
import { Button } from '@buzz8n/ui/components/button'
import { Skeleton } from '@buzz8n/ui/components/skeleton'
import '@buzz8n/ui/globals.css'
```

Add components from the web app (shadcn CLI targets this package):

```bash
cd apps/web
bunx --bun shadcn@latest add skeleton -c apps/web
```

## Theming

Design tokens live in `src/styles/globals.css` (light + dark). Apps inject fonts via CSS variables `--font-sans`, `--font-serif`, `--font-mono`.

## Components

See `src/components/` for the full inventory (button, form, dialog, sheet, table, skeleton, …).
