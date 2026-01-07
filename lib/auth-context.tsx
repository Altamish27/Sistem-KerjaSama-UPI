"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User as SupabaseUser, type AuthChangeEvent, type Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { type User } from "./mock-data"

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Fetch user data from database
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userData) {
            // Convert database user to app user format
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as User['role'],
              unit: userData.unit || '',
              password: '', // Don't store password
            })
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Fetch updated user data
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as User['role'],
              unit: userData.unit || '',
              password: '',
            })
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      if (data.user) {
        setSupabaseUser(data.user)
        
        // Fetch user data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (userData) {
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as User['role'],
            unit: userData.unit || '',
            password: '',
          })
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

