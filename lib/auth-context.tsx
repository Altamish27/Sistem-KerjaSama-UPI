"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
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
  const fetchingUserRef = useRef(false)
  const lastFetchedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        // Add timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])
        
        const session = result.data?.session
        
        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Fetch user data from database with timeout
          try {
            const userPromise = supabase
              .from('users')
              .select('id, name, email, role, fakultas, institution')
              .eq('id', session.user.id)
              .single()
            
            const userTimeout = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('User fetch timeout')), 5000)
            )
            
            const userResult = await Promise.race([
              userPromise,
              userTimeout
            ])
            
            if (userResult.error) {
              console.error("Error fetching user data:", userResult.error.message || userResult.error)
              // Sign out if user data can't be fetched
              await supabase.auth.signOut()
              setSupabaseUser(null)
              setUser(null)
            } else if (userResult.data) {
              // Convert database user to app user format
              lastFetchedUserIdRef.current = session.user.id
              setUser({
                id: userResult.data.id,
                name: userResult.data.name,
                email: userResult.data.email,
                role: userResult.data.role as User['role'],
                unit: userResult.data.fakultas || userResult.data.institution || '',
                password: '', // Don't store password
              })
            }
          } catch (fetchError) {
            console.error("Error fetching user data:", fetchError instanceof Error ? fetchError.message : 'Unknown error')
            // Don't sign out on fetch error, just log it
          }
        }
      } catch (error) {
        console.error("Error checking session:", error instanceof Error ? error.message : 'Unknown error')
        // Clear invalid session
        setSupabaseUser(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          setSupabaseUser(null)
          setUser(null)
          lastFetchedUserIdRef.current = null
          return
        }
        
        if (session?.user) {
          setSupabaseUser(session.user)
          
          // Skip if already fetching or already fetched this user
          if (fetchingUserRef.current || lastFetchedUserIdRef.current === session.user.id) {
            console.log('⏭️ Skipping duplicate user fetch')
            return
          }
          
          // Only fetch user data if event is SIGNED_IN and we don't have user data
          if (event === 'SIGNED_IN' && !user) {
            fetchingUserRef.current = true
            try {
              // Fetch updated user data with increased timeout
              const userPromise = supabase
                .from('users')
                .select('id, name, email, role, fakultas, institution')
                .eq('id', session.user.id)
                .single()
              
              const timeout = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('User fetch timeout')), 8000)
              )
              
              const userResult = await Promise.race([
                userPromise,
                timeout
              ])
              
              if (userResult.error) {
                console.error('Error fetching user:', userResult.error.message || userResult.error)
              } else if (userResult.data) {
                lastFetchedUserIdRef.current = session.user.id
                setUser({
                  id: userResult.data.id,
                  name: userResult.data.name,
                  email: userResult.data.email,
                  role: userResult.data.role as User['role'],
                  unit: userResult.data.fakultas || userResult.data.institution || '',
                  password: '',
                })
              }
            } catch (error) {
              console.error('Error in auth state change:', error instanceof Error ? error.message : 'Unknown error')
            } finally {
              fetchingUserRef.current = false
            }
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
          lastFetchedUserIdRef.current = null
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email)
      
      // Login with timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      )
      
      const result = await Promise.race([
        loginPromise,
        timeout
      ])

      if (result.error) {
        console.error("❌ Login error:", result.error.message || result.error)
        return false
      }

      if (result.data?.user) {
        console.log('✅ Supabase auth successful, user ID:', result.data.user.id)
        setSupabaseUser(result.data.user)
        
        // Fetch user data with retry logic
        let retries = 3
        let userData = null
        let lastError: any = null
        
        console.log('📊 Fetching user data from database...')
        
        while (retries > 0 && !userData) {
          try {
            const userPromise = supabase
              .from('users')
              .select('id, name, email, role, fakultas, institution')
              .eq('id', result.data.user.id)
              .single()
            
            const userTimeout = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('User fetch timeout')), 5000)
            )
            
            const userResult = await Promise.race([
              userPromise,
              userTimeout
            ])
            
            if (userResult.error) {
              console.warn('⚠️ Error fetching user:', userResult.error.message || userResult.error)
              lastError = userResult.error
              retries--
              if (retries > 0) {
                console.log(`🔄 Retrying user fetch... (${retries} attempts left)`)
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } else if (userResult.data) {
              console.log('✅ User data fetched successfully:', userResult.data.email)
              userData = userResult.data
              break
            } else {
              console.warn('⚠️ No user data returned')
              retries--
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }
          } catch (error) {
            console.warn('⚠️ Exception fetching user:', error instanceof Error ? error.message : 'Unknown error')
            lastError = error
            retries--
            if (retries > 0) {
              console.log(`🔄 Retrying user fetch... (${retries} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
        
        if (userData) {
          console.log('✅ Login successful! Setting user data...')
          lastFetchedUserIdRef.current = result.data.user.id
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as User['role'],
            unit: userData.fakultas || userData.institution || '',
            password: '',
          })
          return true
        } else {
          const errorMsg = lastError instanceof Error ? lastError.message : 
                          lastError?.message || 'Unknown error'
          console.error('❌ Failed to fetch user data after retries:', errorMsg)
          console.log('ℹ️ Auth succeeded but user profile not found in database')
          console.log('ℹ️ This might mean the user exists in Auth but not in users table')
          // DON'T sign out - let auth state persist
          // The user might need to complete registration
          return false
        }
      } else {
        console.warn('⚠️ No user data in auth result')
      }

      return false
    } catch (error) {
      console.error("❌ Login exception:", error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      lastFetchedUserIdRef.current = null
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

