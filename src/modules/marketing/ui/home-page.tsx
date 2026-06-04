"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Link2,
  ListChecks,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react"

import { PublicPage } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

const featureCards = [
  {
    icon: ListChecks,
    title: "Creación clara",
    description:
      "Configura estructura, cupos, reglas, premios y método de pago desde un único flujo.",
  },
  {
    icon: UsersRound,
    title: "Con o sin categorías",
    description:
      "Monta torneos simples o con categorías donde precio y cupos tienen reglas propias.",
  },
  {
    icon: ShieldCheck,
    title: "Inscripción controlada",
    description:
      "La entrada pública pasa por solicitud previa y validación por email antes de confirmar.",
  },
  {
    icon: CreditCard,
    title: "Pagos preparados",
    description:
      "Efectivo con validación manual desde el panel y base lista para el pago online.",
  },
  {
    icon: CheckCircle2,
    title: "Panel operativo",
    description:
      "Revisa confirmadas, pendientes de efectivo, pendientes online y acciones clave.",
  },
  {
    icon: Link2,
    title: "Difusión rápida",
    description:
      "Comparte el enlace público del torneo y centraliza la entrada de participantes.",
  },
] as const

const steps = [
  "Crea y publica el torneo",
  "Comparte el enlace público",
  "Valida inscripciones y pagos",
] as const

export function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleCreateTournament = () => {
    if (!user) {
      router.push("/login?next=%2Fcrear-torneo")
      return
    }

    router.push("/crear-torneo")
  }

  return (
    <PublicPage size="wide" className="py-8 md:py-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            <Trophy className="size-4 text-primary" />
            Organiza Torneo
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Organiza torneos locales con un flujo más limpio y coherente.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Crea, publica y gestiona torneos para tu comunidad. Comparte un enlace público,
            recoge solicitudes de inscripción y mantén el control real de estados, cupos y pagos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={handleCreateTournament}>
              Crear torneo
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/explorar">Explorar torneos</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Flujo principal</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm font-medium text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Menos ambigüedad, más control operativo.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            La app está pensada para que el organizador no dependa de hojas sueltas, mensajes
            perdidos o estados confusos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.title}>
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </PublicPage>
  )
}
