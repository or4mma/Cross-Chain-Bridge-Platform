import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for locked assets
const lockedAssets = new Map()
let nextNonce = 0

// Mock functions to simulate contract behavior
function lockAssets(amount: number, recipient: string, targetChain: number) {
  if (amount <= 0) throw new Error("Invalid amount")
  const nonce = nextNonce++
  return nonce
}

function unlockAssets(chainId: number, txHash: string, amount: number, recipient: string) {
  if (lockedAssets.has(`${chainId}-${txHash}`)) throw new Error("Already processed")
  lockedAssets.set(`${chainId}-${txHash}`, { amount, recipient })
  return true
}

function getLockedAssets(chainId: number, txHash: string) {
  return lockedAssets.get(`${chainId}-${txHash}`)
}

describe("Bridge Contract", () => {
  beforeEach(() => {
    lockedAssets.clear()
    nextNonce = 0
  })
  
  it("should lock assets", () => {
    const nonce = lockAssets(100, "recipient1", 1)
    expect(nonce).toBe(0)
  })
  
  it("should not lock assets with invalid amount", () => {
    expect(() => lockAssets(0, "recipient1", 1)).toThrow("Invalid amount")
  })
  
  it("should unlock assets", () => {
    const result = unlockAssets(1, "tx123", 100, "recipient1")
    expect(result).toBe(true)
    const assets = getLockedAssets(1, "tx123")
    expect(assets).toEqual({ amount: 100, recipient: "recipient1" })
  })
  
  it("should not unlock assets twice", () => {
    unlockAssets(1, "tx123", 100, "recipient1")
    expect(() => unlockAssets(1, "tx123", 100, "recipient1")).toThrow("Already processed")
  })
})

