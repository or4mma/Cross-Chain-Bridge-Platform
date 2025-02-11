import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for proposals and votes
const proposals = new Map()
const votes = new Map()
let nextProposalId = 0
let currentBlockHeight = 0

// Mock functions to simulate contract behavior
function createProposal(description: string, votingPeriod: number) {
  const proposalId = nextProposalId++
  proposals.set(proposalId, {
    description,
    votesFor: 0,
    votesAgainst: 0,
    endBlock: currentBlockHeight + votingPeriod,
    executed: false,
  })
  return proposalId
}

function vote(proposalId: number, voteFor: boolean, voter: string) {
  const proposal = proposals.get(proposalId)
  if (!proposal) throw new Error("Proposal not found")
  if (currentBlockHeight >= proposal.endBlock) throw new Error("Voting ended")
  if (votes.has(`${proposalId}-${voter}`)) throw new Error("Already voted")
  votes.set(`${proposalId}-${voter}`, voteFor)
  if (voteFor) {
    proposal.votesFor++
  } else {
    proposal.votesAgainst++
  }
  proposals.set(proposalId, proposal)
  return true
}

function executeProposal(proposalId: number) {
  const proposal = proposals.get(proposalId)
  if (!proposal) throw new Error("Proposal not found")
  if (currentBlockHeight < proposal.endBlock) throw new Error("Voting not ended")
  if (proposal.executed) throw new Error("Already executed")
  if (proposal.votesFor > proposal.votesAgainst) {
    proposal.executed = true
    proposals.set(proposalId, proposal)
    return true
  }
  throw new Error("Proposal rejected")
}

function getProposal(proposalId: number) {
  return proposals.get(proposalId)
}

describe("Governance Contract", () => {
  beforeEach(() => {
    proposals.clear()
    votes.clear()
    nextProposalId = 0
    currentBlockHeight = 0
  })
  
  it("should create a proposal", () => {
    const proposalId = createProposal("Test proposal", 100)
    expect(proposalId).toBe(0)
    const proposal = getProposal(proposalId)
    expect(proposal).toBeDefined()
    expect(proposal.description).toBe("Test proposal")
  })
  
  it("should allow voting", () => {
    const proposalId = createProposal("Test proposal", 100)
    const result = vote(proposalId, true, "voter1")
    expect(result).toBe(true)
    const proposal = getProposal(proposalId)
    expect(proposal.votesFor).toBe(1)
  })
  
  it("should not allow voting twice", () => {
    const proposalId = createProposal("Test proposal", 100)
    vote(proposalId, true, "voter1")
    expect(() => vote(proposalId, false, "voter1")).toThrow("Already voted")
  })
  
  it("should not allow voting after end block", () => {
    const proposalId = createProposal("Test proposal", 100)
    currentBlockHeight = 101
    expect(() => vote(proposalId, true, "voter1")).toThrow("Voting ended")
  })
  
  it("should execute a passed proposal", () => {
    const proposalId = createProposal("Test proposal", 100)
    vote(proposalId, true, "voter1")
    vote(proposalId, true, "voter2")
    vote(proposalId, false, "voter3")
    currentBlockHeight = 101
    const result = executeProposal(proposalId)
    expect(result).toBe(true)
    const proposal = getProposal(proposalId)
    expect(proposal.executed).toBe(true)
  })
  
  it("should not execute a rejected proposal", () => {
    const proposalId = createProposal("Test proposal", 100)
    vote(proposalId, false, "voter1")
    vote(proposalId, false, "voter2")
    vote(proposalId, true, "voter3")
    currentBlockHeight = 101
    expect(() => executeProposal(proposalId)).toThrow("Proposal rejected")
  })
})

