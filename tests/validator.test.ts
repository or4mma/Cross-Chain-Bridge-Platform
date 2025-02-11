import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for validators
const validators = new Map()
let bridgeWallet = "initialWallet"

// Mock functions to simulate contract behavior
function addValidator(validator: string) {
  validators.set(validator, true)
  return true
}

function removeValidator(validator: string) {
  validators.delete(validator)
  return true
}

function isValidator(validator: string) {
  return validators.get(validator) || false
}

function getBridgeWallet() {
  return bridgeWallet
}

describe("Validator Contract", () => {
  beforeEach(() => {
    validators.clear()
    bridgeWallet = "initialWallet"
  })
  
  it("should add a validator", () => {
    const result = addValidator("validator1")
    expect(result).toBe(true)
    expect(isValidator("validator1")).toBe(true)
  })
  
  it("should remove a validator", () => {
    addValidator("validator1")
    const result = removeValidator("validator1")
    expect(result).toBe(true)
    expect(isValidator("validator1")).toBe(false)
  })
  
  it("should check if an address is a validator", () => {
    addValidator("validator1")
    expect(isValidator("validator1")).toBe(true)
    expect(isValidator("validator2")).toBe(false)
  })
  
  it("should get the bridge wallet", () => {
    expect(getBridgeWallet()).toBe("initialWallet")
  })
})

