"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import GoogleIcon from "@/components/icons/GoogleIcon"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

function LoginContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextPath = searchParams.get("next") || "/"

  useEffect(() => {
    const authError = searchParams.get("authError")
    if (!authError) return

    setError(decodeURIComponent(authError))
  }, [searchParams])

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) throw authError
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError
      }

      router.push(nextPath)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error inesperado.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)

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
            onSubmit={(event) => {
              event.preventDefault()
              void handleAuth()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="auth-email">Correo electrónico</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Contraseña</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
              onClick={() => setIsLogin(!isLogin)}
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
