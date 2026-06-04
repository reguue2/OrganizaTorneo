import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { TournamentRow } from "@/modules/organizer/domain"

import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function ManagementConfigForm({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const { busy, form, saveConfig, setForm } = dashboard

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="management-title">Título del torneo</Label>
        <Input
          id="management-title"
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="management-province">Provincia</Label>
          <Input
            id="management-province"
            value={form.province}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, province: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="management-address">Dirección</Label>
          <Input
            id="management-address"
            value={form.address}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, address: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="management-date">Fecha del torneo</Label>
          <Input
            id="management-date"
            type="datetime-local"
            value={form.date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, date: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="management-deadline">Fecha límite de inscripción</Label>
          <Input
            id="management-deadline"
            type="datetime-local"
            value={form.registration_deadline}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                registration_deadline: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="management-description">Descripción</Label>
        <Textarea
          id="management-description"
          className="min-h-32"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Añade una descripción clara del torneo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="management-rules">Reglas / normativa</Label>
        <Textarea
          id="management-rules"
          className="min-h-40"
          value={form.rules}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, rules: event.target.value }))
          }
          placeholder="Normativa, formato, condiciones y requisitos"
        />
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <span>
          <span className="block font-medium text-foreground">Visibilidad pública</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Si lo desactivas, el torneo no se listará en explorar y solo será accesible por
            enlace directo.
          </span>
        </span>
        <input
          type="checkbox"
          checked={form.is_public}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, is_public: event.target.checked }))
          }
          className="size-5 shrink-0 rounded border-border accent-primary"
        />
      </label>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          onClick={saveConfig}
          disabled={busy === "save-config" || tournament.status !== "published"}
        >
          {busy === "save-config"
            ? "Guardando..."
            : tournament.status === "published"
              ? "Guardar cambios"
              : "Edición bloqueada"}
        </Button>
      </div>
    </div>
  )
}
