"use client"

import { Suspense, useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import GoogleIcon from "@/components/icons/GoogleIcon"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

type AuthField = "name" | "email" | "password" | "confirmPassword"
type AuthFieldErrors = Partial<Record<AuthField, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})

  const nextPath = searchParams.get("next") || "/"

  useEffect(() => {
    const authError = searchParams.get("authError")
    if (!authError) return

    setError(decodeURIComponent(authError))
  }, [searchParams])

  const validateForm = (): AuthFieldErrors => {
    const nextErrors: AuthFieldErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!isLogin && !trimmedName) {
      nextErrors.name = "El nombre es obligatorio."
    }

    if (!trimmedEmail) {
      nextErrors.email = "El correo electrónico es obligatorio."
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Introduce un correo electrónico válido."
    }

    if (!password) {
      nextErrors.password = "La contraseña es obligatoria."
    } else if (!isLogin && password.length < 6) {
      nextErrors.password = "La contraseña debe tener al menos 6 caracteres."
    }

    if (!isLogin && !confirmPassword) {
      nextErrors.confirmPassword = "Confirma la contraseña."
    } else if (!isLogin && password !== confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden."
    }

    return nextErrors
  }

  const clearFieldError = (field: AuthField) => {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleAuth = async () => {
    const nextFieldErrors = validateForm()

    setError(null)
    setFieldErrors(nextFieldErrors)

    if (Object.keys(nextFieldErrors).length > 0) return

    setLoading(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedName = name.trim()

      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })

        if (authError) throw authError
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              name: trimmedName,
              full_name: trimmedName,
            },
          },
        })

        if (authError) throw authError
      }

      router.push(nextPath)
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ha ocurrido un error inesperado."

      if (/invalid login credentials/i.test(message)) {
        setFieldErrors({ password: "Email o contraseña incorrectos." })
      } else if (/already registered|already exists|user already/i.test(message)) {
        setFieldErrors({ email: "Ya existe una cuenta con este correo." })
      } else if (/password/i.test(message)) {
        setFieldErrors({ password: message })
      } else if (/email/i.test(message)) {
        setFieldErrors({ email: message })
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setFieldErrors({})

    const redirectUrl = new URL(`${window.location.origin}/auth/callback`)
    redirectUrl.searchParams.set("next", nextPath)

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Accede a tu panel de organizador." : "Crea tu cuenta de organizador."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Continuar con Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">o</span>
            <Separator className="flex-1" />
          </div>

          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void handleAuth()
            }}
          >
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Nombre</Label>
                <Input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    clearFieldError("name")
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Correo electrónico</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearFieldError("email")
                }}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  className="pr-11"
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearFieldError("password")
                    clearFieldError("confirmPassword")
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    className="pr-11"
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      clearFieldError("confirmPassword")
                    }}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                    aria-pressed={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword((isVisible) => !isVisible)
                    }
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Registrarse"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFieldErrors({})
                setConfirmPassword("")
                setShowPassword(false)
                setShowConfirmPassword(false)
              }}
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
