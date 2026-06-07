'use client'

import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { socket } from "../../../lib/socket"
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe");

    if (saved) {
      const { email, password } = JSON.parse(saved);

      setValue("email", email);
      setValue("password", password);
      setValue("rememberMe", true);
    }
  }, []);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true)
    try {
      const res: any = await axiosInstance.post('/auth/login', data);
      if (res.success) {
       
        socket.auth = {
          token: res.access_token,
        };

        socket.connect();

        if (data?.rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              email: data.email,
              password: data.password,
            })
          );
        }

        localStorage.setItem("authToken", res.access_token)
        localStorage.setItem("refreshToken", res.refresh_token)
        localStorage.setItem("user", JSON.stringify(res))
        router.replace("/chat")


        toast.success(res.message || "Login successfully!")
      }
    } catch (error: any) {
      toast.error(error)

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      title="Welcome Back"
      description="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            className="h-11"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="rememberMe"
            {...register('rememberMe')}
            className="h-4 w-4"
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal cursor-pointer"
          >
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium mt-6"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Don&apos;t have an account?
          </span>
        </div>
      </div>

      <Link href="/register">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary font-medium"
        >
          Create Account
        </Button>
      </Link>
    </AuthForm>
  )
}
