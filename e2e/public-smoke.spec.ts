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
    await expect(page.getByLabel("Contraseña")).toBeVisible()
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible()
  })
})
