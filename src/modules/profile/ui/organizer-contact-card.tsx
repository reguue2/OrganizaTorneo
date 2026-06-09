import { Mail, MessageCircle, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      <CardHeader>
        <CardTitle>Contactar con el organizador</CardTitle>
        <CardDescription>
          {contact.name
            ? `Habla con ${contact.name} para pagar o resolver dudas.`
            : "Habla con el organizador para pagar o resolver dudas."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {whatsappLink && (
          <Button asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle data-icon="inline-start" />
              WhatsApp
            </a>
          </Button>
        )}
        {contact.phone && (
          <Button asChild variant="outline">
            <a href={`tel:${contact.phone}`}>
              <Phone data-icon="inline-start" />
              Llamar
            </a>
          </Button>
        )}
        {contact.email && (
          <Button asChild variant="outline">
            <a href={`mailto:${contact.email}`}>
              <Mail data-icon="inline-start" />
              Email
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
