import { cn } from '@buzz8n/ui/lib/utils'
import Image from 'next/image'

interface ScreenshotProps {
  src: string
  alt: string
  caption?: string
  className?: string
}

export function Screenshot({ src, alt, caption, className }: ScreenshotProps) {
  return (
    <figure className={cn('my-6', className)}>
      <div className="rounded-lg border overflow-hidden bg-muted/30">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="w-full h-auto"
          priority={false}
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
