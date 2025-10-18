import { describe, test, expect } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import InputPassword from '@apps/web/components/shadcn-studio/input/password-input'

describe.skip('InputPassword Component (skipped; focus on flows)', () => {
  test('should render with default value', () => {
    render(<InputPassword defaultValue="my-secret-password" />)
    const input = screen.getByLabelText('Secret Key')
    expect(input).toBeTruthy()
    expect((input as HTMLInputElement).value).toBe('my-secret-password')
  })

  test('should render input as password type by default', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  test('should render input as readonly', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  test('should toggle visibility to text type when eye icon is clicked', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    const toggleButton = screen.getByRole('button')

    expect(input.type).toBe('password')

    fireEvent.click(toggleButton)

    expect(input.type).toBe('text')
  })

  test('should toggle back to password type when clicked again', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    const toggleButton = screen.getByRole('button')

    fireEvent.click(toggleButton)
    expect(input.type).toBe('text')

    fireEvent.click(toggleButton)
    expect(input.type).toBe('password')
  })

  test('should show EyeIcon when password is hidden', () => {
    render(<InputPassword defaultValue="secret" />)
    const button = screen.getByRole('button')
    expect(screen.getByText('Show password')).toBeTruthy()
  })

  test('should show EyeOffIcon when password is visible', () => {
    render(<InputPassword defaultValue="secret" />)
    const toggleButton = screen.getByRole('button')

    fireEvent.click(toggleButton)

    expect(screen.getByText('Hide password')).toBeTruthy()
  })

  test('should render with custom className', () => {
    render(<InputPassword defaultValue="secret" className="custom-input-class" />)
    const input = screen.getByLabelText('Secret Key')
    expect(input.className).toContain('custom-input-class')
  })

  test('should handle empty default value', () => {
    render(<InputPassword defaultValue="" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    expect(input.value).toBe('')
  })

  test('should handle long secret values', () => {
    const longSecret = 'a'.repeat(1000)
    render(<InputPassword defaultValue={longSecret} />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    expect(input.value).toBe(longSecret)
  })

  test('should handle special characters in value', () => {
    const specialValue = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
    render(<InputPassword defaultValue={specialValue} />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    expect(input.value).toBe(specialValue)
  })

  test('should render label with correct text', () => {
    render(<InputPassword defaultValue="secret" />)
    expect(screen.getByText('Secret Key')).toBeTruthy()
  })

  test('should have placeholder text', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toBeTruthy()
  })

  test('should maintain state across multiple toggles', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement
    const toggleButton = screen.getByRole('button')

    for (let i = 0; i < 5; i++) {
      fireEvent.click(toggleButton)
      expect(input.type).toBe(i % 2 === 0 ? 'text' : 'password')
    }
  })

  test('should generate unique id for each instance', () => {
    const { container: container1 } = render(<InputPassword defaultValue="secret1" />)
    const { container: container2 } = render(<InputPassword defaultValue="secret2" />)

    const input1 = container1.querySelector('input')
    const input2 = container2.querySelector('input')

    expect(input1?.id).toBeTruthy()
    expect(input2?.id).toBeTruthy()
    expect(input1?.id).not.toBe(input2?.id)
  })

  test('should have correct ARIA label for accessibility', () => {
    render(<InputPassword defaultValue="secret" />)
    const toggleButton = screen.getByRole('button')
    const srText = toggleButton.querySelector('.sr-only')
    expect(srText).toBeTruthy()
    expect(srText?.textContent).toBe('Show password')
  })

  test('should update ARIA label after toggle', () => {
    render(<InputPassword defaultValue="secret" />)
    const toggleButton = screen.getByRole('button')

    fireEvent.click(toggleButton)

    const srText = toggleButton.querySelector('.sr-only')
    expect(srText?.textContent).toBe('Hide password')
  })

  test('should apply correct styling classes', () => {
    render(<InputPassword defaultValue="secret" />)
    const input = screen.getByLabelText('Secret Key')
    expect(input.className).toContain('pr-9')
    expect(input.className).toContain('h-10')
  })

  test('should not allow editing due to readonly attribute', () => {
    render(<InputPassword defaultValue="original" />)
    const input = screen.getByLabelText('Secret Key') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'new-value' } })

    expect(input.value).toBe('original')
  })
})
