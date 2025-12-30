"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Proposal, ApprovalHistory } from "@/lib/mock-data"

interface DataStoreContextType {
  proposals: Proposal[]
  isLoading: boolean
  getProposalById: (id: string) => Proposal | undefined
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>
  addProposal: (proposal: Proposal) => Promise<void>
  deleteProposal: (id: string) => Promise<void>
  addApprovalHistory: (proposalId: string, history: ApprovalHistory) => Promise<void>
  updateProposalStatus: (proposalId: string, status: Proposal["status"]) => Promise<void>
  refreshData: () => Promise<void>
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  // Initialize dengan data dari API/file
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data dari API saat mount
  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/proposals")
      const data = await response.json()
      setProposals(data)
    } catch (error) {
      console.error("Error loading proposals:", error)
      setProposals([])
    } finally {
      setIsLoading(false)
    }
  }

  const getProposalById = useCallback(
    (id: string) => {
      return proposals.find((p) => p.id === id)
    },
    [proposals],
  )

  const updateProposal = useCallback(async (id: string, updates: Partial<Proposal>) => {
    try {
      const response = await fetch("/api/proposals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      })
      const updatedProposal = await response.json()
      setProposals((prev) => prev.map((p) => (p.id === id ? updatedProposal : p)))
    } catch (error) {
      console.error("Error updating proposal:", error)
    }
  }, [])

  const addProposal = useCallback(async (proposal: Proposal) => {
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      })
      const newProposal = await response.json()
      setProposals((prev) => [...prev, newProposal])
    } catch (error) {
      console.error("Error adding proposal:", error)
    }
  }, [])

  const deleteProposal = useCallback(async (id: string) => {
    try {
      await fetch(`/api/proposals?id=${id}`, {
        method: "DELETE",
      })
      setProposals((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting proposal:", error)
    }
  }, [])

  const addApprovalHistory = useCallback(async (proposalId: string, history: ApprovalHistory) => {
    const proposal = proposals.find((p) => p.id === proposalId)
    if (!proposal) return

    const updates = {
      approvalHistory: [...proposal.approvalHistory, history],
    }

    await updateProposal(proposalId, updates)
  }, [proposals, updateProposal])

  const updateProposalStatus = useCallback(async (proposalId: string, status: Proposal["status"]) => {
    await updateProposal(proposalId, { status })
  }, [updateProposal])

  const refreshData = useCallback(async () => {
    await loadProposals()
  }, [])

  return (
    <DataStoreContext.Provider
      value={{
        proposals,
        isLoading,
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
