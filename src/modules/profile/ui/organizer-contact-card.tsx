import { Mail, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildTournamentContactMessage,
  buildWhatsappLink,
  type OrganizerPublicContact,
} from "@/modules/profile/domain"

export function OrganizerContactCard({
  contact,
  tournamentTitle,
}: {
  contact: OrganizerPublicContact
  tournamentTitle: string
}) {
  const whatsappLink = contact.whatsapp
    ? buildWhatsappLink(
        contact.whatsapp,
        buildTournamentContactMessage(tournamentTitle)
      )
    : null

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            {contact.name ? `Organiza ${contact.name}` : "Contactar con el organizador"}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Escríbele para pagar o resolver cualquier duda del torneo.
          </p>
        </div>

        <div className="space-y-2">
          {whatsappLink && (
            <Button asChild size="lg" className="w-full">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle data-icon="inline-start" />
                WhatsApp
              </a>
            </Button>
          )}
          {contact.contactEmail && (
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href={`mailto:${contact.contactEmail}`}>
                <Mail data-icon="inline-start" />
                Email
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
