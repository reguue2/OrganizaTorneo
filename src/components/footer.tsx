import Link from "next/link"

const footerGroups = [
  {
    title: "Producto",
    links: [
      { label: "Explorar torneos", href: "/explorar" },
      { label: "Crear torneo", href: "/crear-torneo" },
      { label: "Mis torneos", href: "/mis-torneos" },
    ],
  },
  {
    title: "Cuenta",
    links: [{ label: "Iniciar sesión", href: "/login" }],
  },
] as const

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
        <div className="max-w-md">
          <Link href="/" className="text-base font-semibold text-foreground">
            Organiza Torneo
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Plataforma para crear, publicar y gestionar torneos locales con
            inscripciones claras y pagos controlados.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-medium text-foreground">{group.title}</h2>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border py-4">
        <div className="mx-auto w-full max-w-7xl px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          © 2026 Organiza Torneo.
        </div>
      </div>
    </footer>
  )
}
