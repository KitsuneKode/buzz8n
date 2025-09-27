'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@buzz8n/ui/components/form'
import { Button } from '@buzz8n/ui/components/button'
import { zodResolver } from '@hookform/resolvers/zod'
import PasswordComponent from '@/components/password'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { signUpSchema } from '@buzz8n/common/types'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { Dog } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

type SignupFormSchema = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const form = useForm<SignupFormSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  })

  const { signUp, signUpError, isSigningUp } = useAuth()

  // const { mutate, error, isError, isPending } = useMutation({
  //   mutationFn: async (formData: SignupFormSchema) => {
  //     const url = `${API_URL}/sign-up`
  //     const response = await axios.post(url, {
  //       email: formData.email,
  //       name: formData.name,
  //       password: formData.password,
  //     })
  //
  //     return response.data
  //   },
  //   onSuccess: (data) => {
  //     console.log('Sign-up successful:', data)
  //     toast.success('Account created successfully! Please sign in.')
  //     router.push('/signin')
  //   },
  //   onError: (error: AxiosError) => {
  //     console.error('Sign-up error:', error)
  //   },
  // })

  async function onSubmit(formData: SignupFormSchema) {
    signUp(formData)
  }

  const {
    formState: { isSubmitting },
    watch,
  } = form

  const hasValues = !!watch('email') && !!watch('name') && !!watch('password')
  const isLoading = isSubmitting || isSigningUp

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
        >
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            <div className="text-center">
              <Link href="/" aria-label="go home" className="mx-auto block w-fit">
                <Dog />
              </Link>
              <h1 className="mb-1 mt-4 text-xl font-semibold">Create a Tailark Account</h1>
              <p className="text-sm">Welcome! Create an account to get started</p>
            </div>

            {signUpError && (
              <div className="mt-4 p-3 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {signUpError}
              </div>
            )}

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@mail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pwd" className="text-sm">
                    Password
                  </Label>
                  <Button asChild variant="link" size="sm">
                    <Link href="#" className="link intent-info variant-ghost text-sm">
                      Forgot your Password ?
                    </Link>
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PasswordComponent id="pwd" field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !hasValues}
                aria-busy={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Button>
            </div>

            <div className="mb-6"></div>
          </div>

          <div className="p-3">
            <p className="text-accent-foreground text-center text-sm">
              Have an account ?
              <Button asChild variant="link" className="px-2">
                <Link href="/signin">Sign In</Link>
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </section>
  )
}
