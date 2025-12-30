import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Proposal } from "@/lib/mock-data"

const DATA_FILE = path.join(process.cwd(), "data", "proposals.json")

// Helper untuk ensure file exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]))
  }
}

// GET - Read all proposals
export async function GET() {
  try {
    await ensureDataFile()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const proposals: Proposal[] = JSON.parse(data)
    return NextResponse.json(proposals)
  } catch (error) {
    console.error("Error reading proposals:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST - Create new proposal
export async function POST(request: NextRequest) {
  try {
    await ensureDataFile()
    const newProposal: Proposal = await request.json()

    const data = await fs.readFile(DATA_FILE, "utf-8")
    const proposals: Proposal[] = JSON.parse(data)

    proposals.push(newProposal)

    await fs.writeFile(DATA_FILE, JSON.stringify(proposals, null, 2))

    return NextResponse.json(newProposal, { status: 201 })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}

// PUT - Update proposal
export async function PUT(request: NextRequest) {
  try {
    await ensureDataFile()
    const { id, updates } = await request.json()

    const data = await fs.readFile(DATA_FILE, "utf-8")
    const proposals: Proposal[] = JSON.parse(data)

    const index = proposals.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    proposals[index] = {
      ...proposals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(proposals, null, 2))

    return NextResponse.json(proposals[index])
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}

// DELETE - Delete proposal
export async function DELETE(request: NextRequest) {
  try {
    await ensureDataFile()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const data = await fs.readFile(DATA_FILE, "utf-8")
    const proposals: Proposal[] = JSON.parse(data)

    const filtered = proposals.filter((p) => p.id !== id)

    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ error: "Failed to delete proposal" }, { status: 500 })
  }
}
