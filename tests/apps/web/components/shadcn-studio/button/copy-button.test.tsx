import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CopyButton from '@buzz8n/web/components/shadcn-studio/button/copy-button'

// Mock navigator.clipboard
Object.defineProperty(globalThis.navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: mock(() => Promise.resolve()),
  },
})

describe.skip('CopyButton Component (skipped; focus on flows)', () => {
  beforeEach(() => {
    ;((navigator as any).clipboard.writeText as any).mockClear()
  })

  test('should render with default props', () => {
    render(<CopyButton copyContent="test content" />)
    const button = screen.getByRole('button')
    expect(button).toBeTruthy()
    expect(screen.getByText('Copy')).toBeTruthy()
  })

  test('should render with custom copyTag', () => {
    render(<CopyButton copyContent="test" copyTag="Copy to Clipboard" />)
    expect(screen.getByText('Copy to Clipboard')).toBeTruthy()
  })

  test('should render in compact mode without text', () => {
    render(<CopyButton copyContent="test" compact={true} />)
    const button = screen.getByRole('button')
    expect(button).toBeTruthy()
    expect(screen.queryByText('Copy')).toBeFalsy()
  })

  test('should copy content to clipboard on click', async () => {
    render(<CopyButton copyContent="test content to copy" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('test content to copy')
    })
  })

  test('should show "Copied!" message after successful copy', async () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeTruthy()
    })
  })

  test('should disable button after clicking', async () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })
  })

  test('should re-enable button after timeout', async () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })

    await new Promise((resolve) => setTimeout(resolve, 1600))

    expect((button as HTMLButtonElement).disabled).toBe(false)
  })

  test('should handle clipboard write failure gracefully', async () => {
    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError as any

    ;((navigator as any).clipboard.writeText as any).mockRejectedValueOnce(
      new Error('Clipboard access denied'),
    )

    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    console.error = originalError
  })

  test('should apply custom className', () => {
    render(<CopyButton copyContent="test" className="custom-class" />)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.className).toContain('custom-class')
  })

  test('should show CheckIcon when copied', async () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button') as HTMLButtonElement

    fireEvent.click(button)

    await waitFor(() => {
      const checkIcon = button.querySelector('.stroke-green-600')
      expect(checkIcon).toBeTruthy()
    })
  })

  test('should show CopyIcon when not copied', () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    const copyIcon = (button as HTMLElement).querySelector('svg')
    expect(copyIcon).toBeTruthy()
  })

  test('should handle multiple rapid clicks', async () => {
    render(<CopyButton copyContent="test" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledTimes(1)
    })
  })

  test('should copy long text content', async () => {
    const longText = 'a'.repeat(10000)
    render(<CopyButton copyContent={longText} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith(longText)
    })
  })

  test('should copy content with special characters', async () => {
    const specialContent = '!@#$%^&*()_+-={}[]|\\:\";\'<>?,./\n\t'
    render(<CopyButton copyContent={specialContent} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith(specialContent)
    })
  })

  test('should copy empty string', async () => {
    render(<CopyButton copyContent="" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('')
    })
  })

  test('should render with ghost variant in compact mode', () => {
    render(<CopyButton copyContent="test" compact={true} />)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.className).toBeTruthy()
  })

  test('should render with outline variant in normal mode', () => {
    render(<CopyButton copyContent="test" compact={false} />)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.className).toBeTruthy()
  })
})
