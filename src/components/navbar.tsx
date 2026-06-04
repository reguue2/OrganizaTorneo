"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { LogOut, Menu, Trophy, UserRound, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Explorar", href: "/explorar", protected: false },
  { label: "Mis torneos", href: "/mis-torneos", protected: true },
  { label: "Crear torneo", href: "/crear-torneo", protected: true },
] as const

export default function Navbar() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const goToRoute = (path: string, isProtected: boolean) => {
    setMobileOpen(false)

    if (isProtected && !user) {
      router.push(`/login?next=${encodeURIComponent(path)}`)
      return
    }

    router.push(path)
  }

  const handleLogout = async () => {
    setUserMenuOpen(false)
    setMobileOpen(false)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate">Organiza Torneo</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => goToRoute(item.href, item.protected)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <Button onClick={() => router.push("/login")}>Comenzar</Button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
                aria-label="Abrir menú de usuario"
                aria-expanded={userMenuOpen}
              >
                {userInitial}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
                  <div className="flex items-center gap-3 border-b border-border px-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <UserRound className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Organizador</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-muted"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm md:hidden"
          aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div className="mx-auto w-full max-w-7xl space-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => goToRoute(item.href, item.protected)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {item.label}
            </button>
          ))}

          <div className="border-t border-border pt-3">
            {!user ? (
              <Button className="w-full" onClick={() => router.push("/login")}>
                Comenzar
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
