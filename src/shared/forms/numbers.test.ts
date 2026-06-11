import { describe, expect, it } from "vitest"
import {
  MAX_POSTGRES_INTEGER,
  isValidMoneyAmount,
  normalizeSixDigitCodeInput,
  parseIntegerInput,
  parseMoneyInput,
} from "./numbers"

describe("parseIntegerInput", () => {
  it("accepts plain and grouped integers", () => {
    expect(parseIntegerInput("1000")).toBe(1000)
    expect(parseIntegerInput("1.000")).toBe(1000)
    expect(parseIntegerInput("1 000")).toBe(1000)
  })

  it("rejects decimals, scientific notation, negatives and overflows", () => {
    expect(parseIntegerInput("1.5")).toBeNull()
    expect(parseIntegerInput("1e3")).toBeNull()
    expect(parseIntegerInput("-1")).toBeNull()
    expect(parseIntegerInput(String(MAX_POSTGRES_INTEGER + 1))).toBeNull()
  })

  it("honors explicit limits", () => {
    expect(parseIntegerInput("999", { max: 999 })).toBe(999)
    expect(parseIntegerInput("1000", { max: 999 })).toBeNull()
    expect(parseIntegerInput("0", { min: 1 })).toBeNull()
  })
})

describe("parseMoneyInput", () => {
  it("accepts Spanish and international money formats", () => {
    expect(parseMoneyInput("10,50")).toBe(10.5)
    expect(parseMoneyInput("10.50")).toBe(10.5)
    expect(parseMoneyInput("1.234,56")).toBe(1234.56)
    expect(parseMoneyInput("1,234.56")).toBe(1234.56)
    expect(parseMoneyInput("€ 10,50")).toBe(10.5)
  })

  it("rejects unsafe or malformed values", () => {
    expect(parseMoneyInput("-1")).toBeNull()
    expect(parseMoneyInput("1e3")).toBeNull()
    expect(parseMoneyInput("0x10")).toBeNull()
    expect(parseMoneyInput("1,234,56")).toBeNull()
    expect(parseMoneyInput("10,1234")).toBeNull()
    expect(parseMoneyInput(",")).toBeNull()
  })
})

describe("isValidMoneyAmount", () => {
  it("only accepts non-negative amounts with at most two decimals", () => {
    expect(isValidMoneyAmount(10.5)).toBe(true)
    expect(isValidMoneyAmount(8.03)).toBe(true)
    expect(isValidMoneyAmount(10.123)).toBe(false)
    expect(isValidMoneyAmount(-1)).toBe(false)
  })
})

describe("normalizeSixDigitCodeInput", () => {
  it("keeps leading zeroes and removes formatting", () => {
    expect(normalizeSixDigitCodeInput(" 01-23 45 ")).toBe("012345")
    expect(normalizeSixDigitCodeInput("123456789")).toBe("123456")
  })
})
