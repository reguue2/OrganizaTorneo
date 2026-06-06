import { expect, test } from "@playwright/test"

test.describe("public shell", () => {
  test("renders the home page and primary navigation", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", {
        name: /organiza torneos locales con un flujo/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole("main").getByRole("link", { name: "Explorar torneos" })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible()
  })

  test("renders the login form without authenticated state", async ({ page }) => {
    await page.goto("/login")

    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" })
    ).toBeVisible()
    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
    await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible()

    const passwordInput = page.getByLabel("Contraseña", { exact: true })
    await expect(passwordInput).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: "Mostrar contraseña" }).click()
    await expect(passwordInput).toHaveAttribute("type", "text")

    await page.getByRole("button", { name: "Regístrate" }).click()

    const confirmPasswordInput = page.getByLabel("Confirmar contraseña", {
      exact: true,
    })
    await expect(confirmPasswordInput).toHaveAttribute("type", "password")
    await page
      .getByRole("button", { name: "Mostrar confirmación de contraseña" })
      .click()
    await expect(confirmPasswordInput).toHaveAttribute("type", "text")
  })
})

test.describe("cash registration", () => {
  test("opens the verification code modal only after email dispatch", async ({
    page,
  }) => {
    await page.route("**/api/public-registration-requests", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          request_id: "20000000-0000-4000-8000-000000000001",
          expires_at: "2026-06-05T19:00:00.000Z",
          amount: 0,
          payment_method: "cash",
          email_delivery_status: "sent",
          email_delivery_message: "Correo enviado correctamente.",
        }),
      })
    })
    await page.route("**/api/public-registration-verifications", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          already_verified: false,
          public_reference: "REG-TEST",
          registration_status: "pending_cash_validation",
          payment_method: "cash",
          amount: 10,
          cancel_code: null,
          cancel_token: null,
          email_delivery_status: null,
          email_delivery_message: null,
        }),
      })
    })

    await page.goto(
      "/torneo/10000000-0000-4000-8000-000000000001/inscribirse"
    )
    await page.getByPlaceholder("Nombre del participante").fill("Participante de prueba")
    await page.getByPlaceholder("Telefono de contacto").fill("666666666")
    await page.getByPlaceholder("Correo de contacto").fill("participante@example.com")
    await page.getByRole("button", { name: "Inscribirse", exact: true }).click()

    const dialog = page.getByRole("dialog", { name: "Confirma tu email" })
    await expect(dialog).toBeVisible()
    await dialog.getByLabel("Código de verificación").fill("123456")
    await dialog.getByRole("button", { name: "Validar código" }).click()

    const completedDialog = page.getByRole("dialog", {
      name: "Inscripción pendiente de pago",
    })
    await expect(
      completedDialog.getByRole("heading", { name: "Inscripción pendiente de pago" })
    ).toBeVisible()
    await expect(completedDialog).toContainText(
      "El organizador confirmará definitivamente tu inscripción"
    )
  })

  test("does not open the code modal when the email provider fails", async ({
    page,
  }) => {
    await page.route("**/api/public-registration-requests", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          request_id: "20000000-0000-4000-8000-000000000002",
          expires_at: "2026-06-05T19:00:00.000Z",
          amount: 0,
          payment_method: "cash",
          email_delivery_status: "provider_error",
          email_delivery_message: "No se pudo enviar el correo.",
        }),
      })
    })

    await page.goto(
      "/torneo/10000000-0000-4000-8000-000000000001/inscribirse"
    )
    await page.getByPlaceholder("Nombre del participante").fill("Participante de prueba")
    await page.getByPlaceholder("Telefono de contacto").fill("666666666")
    await page.getByPlaceholder("Correo de contacto").fill("participante@example.com")
    await page.getByRole("button", { name: "Inscribirse", exact: true }).click()

    await expect(page.getByText("No se pudo enviar el correo.")).toBeVisible()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})

test.describe("online registration", () => {
  test("redirects to Stripe Checkout without opening email verification", async ({
    page,
  }) => {
    await page.goto(
      "/torneo/10000000-0000-4000-8000-000000000003/inscribirse"
    )
    const checkoutUrl = new URL("/stripe-checkout-test", page.url()).toString()

    await page.route("**/api/public-registration-requests", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ checkout_url: checkoutUrl }),
      })
    })

    await page.getByPlaceholder("Nombre del participante").fill("Participante online")
    await page.getByPlaceholder("Telefono de contacto").fill("677777777")
    await page.getByPlaceholder("Correo de contacto").fill("online@example.com")
    await page.getByRole("button", { name: "Pagar e inscribirse" }).click()

    await page.waitForURL("**/stripe-checkout-test")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})
