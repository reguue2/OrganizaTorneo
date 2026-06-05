import { describe, expect, it } from "vitest"

import {
  escapeHtml,
  renderRegistrationConfirmationEmail,
  renderRegistrationVerificationEmail,
} from "./email"

describe("registration email rendering", () => {
  it("escapes html special characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')" />`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot; /&gt;"
    )
  })

  it("escapes dynamic verification email html values", () => {
    const email = renderRegistrationVerificationEmail({
      recipientEmail: "participant@example.com",
      verificationCode: `<123456>`,
      expiresAt: "2999-01-01T10:00:00.000Z",
    })

    expect(email.html).toContain("&lt;123456&gt;")
    expect(email.html).toContain("Introduce este código")
    expect(email.html).not.toContain("<123456>")
  })

  it("escapes dynamic confirmation email html values", () => {
    const email = renderRegistrationConfirmationEmail({
      recipientEmail: "participant@example.com",
      tournamentTitle: `<Torneo onmouseover="alert(1)">`,
      categoryName: `Senior & "Pro"`,
      publicReference: `REF-<1>`,
      registrationStatus: `<confirmed>`,
      paymentMethod: "cash",
      amount: 12,
      cancelCode: `<999999>`,
      cancelUrl: `https://example.com/cancel?token=<token>&next="x"`,
    })

    expect(email.html).toContain("&lt;Torneo onmouseover=&quot;alert(1)&quot;&gt;")
    expect(email.html).toContain("Senior &amp; &quot;Pro&quot;")
    expect(email.html).toContain("REF-&lt;1&gt;")
    expect(email.html).toContain("&lt;confirmed&gt;")
    expect(email.html).toContain("&lt;999999&gt;")
    expect(email.html).toContain(
      "https://example.com/cancel?token=&lt;token&gt;&amp;next=&quot;x&quot;"
    )
    expect(email.html).not.toContain("<Torneo")
    expect(email.html).not.toContain("<token>")
  })
})
