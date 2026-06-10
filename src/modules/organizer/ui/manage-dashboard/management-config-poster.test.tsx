// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ManagementConfigPoster } from "./management-config-poster"

describe("ManagementConfigPoster", () => {
  it("allows selecting the same poster again after clearing it", () => {
    const onClear = vi.fn()
    const onSelect = vi.fn()
    const { rerender } = render(
      <ManagementConfigPoster
        disabled={false}
        fileName=""
        onClear={onClear}
        onSelect={onSelect}
        previewUrl={null}
      />
    )
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const poster = new File(["poster"], "cartel.png", { type: "image/png" })

    fireEvent.change(input, { target: { files: [poster] } })
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(input.value).toBe("")

    rerender(
      <ManagementConfigPoster
        disabled={false}
        fileName="cartel.png"
        onClear={onClear}
        onSelect={onSelect}
        previewUrl="blob:cartel"
      />
    )
    expect(
      screen.getByAltText("Vista previa del cartel").getAttribute("src")
    ).toBe("blob:cartel")
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }))
    fireEvent.change(input, { target: { files: [poster] } })

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledTimes(2)
  })
})
