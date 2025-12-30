"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Proposal, ApprovalHistory } from "@/lib/mock-data"
import { MOCK_PROPOSALS } from "@/lib/mock-data"

interface DataStoreContextType {
  proposals: Proposal[]
  getProposalById: (id: string) => Proposal | undefined
  updateProposal: (id: string, updates: Partial<Proposal>) => void
  addProposal: (proposal: Proposal) => void
  deleteProposal: (id: string) => void
  addApprovalHistory: (proposalId: string, history: ApprovalHistory) => void
  updateProposalStatus: (proposalId: string, status: Proposal["status"]) => void
  refreshData: () => void
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  // Initialize dengan mock data
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS)

  const getProposalById = useCallback(
    (id: string) => {
      return proposals.find((p) => p.id === id)
    },
    [proposals],
  )

  const updateProposal = useCallback((id: string, updates: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }, [])

  const addProposal = useCallback((proposal: Proposal) => {
    setProposals((prev) => [...prev, proposal])
  }, [])

  const deleteProposal = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addApprovalHistory = useCallback((proposalId: string, history: ApprovalHistory) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              approvalHistory: [...p.approvalHistory, history],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }, [])

  const updateProposalStatus = useCallback((proposalId: string, status: Proposal["status"]) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }, [])

  const refreshData = useCallback(() => {
    // Force re-render
    setProposals((prev) => [...prev])
  }, [])

  return (
    <DataStoreContext.Provider
      value={{
        proposals,
        getProposalById,
        updateProposal,
        addProposal,
        deleteProposal,
        addApprovalHistory,
        updateProposalStatus,
        refreshData,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
