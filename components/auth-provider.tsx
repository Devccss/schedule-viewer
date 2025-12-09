"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (token: string, username: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth-token")

      if (!token) {
        setIsLoading(false)
        if (pathname !== "/login") {
          router.push("/login")
        }
        return
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.valid) {
          
          setUsername(data.username)
          document.cookie = `auth-token=${token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
          if (pathname === "/login") {
            router.push("/")
          }
        } else {
          localStorage.removeItem("auth-token")
          document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          
          setUsername(null)
          if (pathname !== "/login") {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error)
        localStorage.removeItem("auth-token")
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        
        setUsername(null)
        if (pathname !== "/login") {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = (token: string, username: string) => {
    localStorage.setItem("auth-token", token)
    document.cookie = `auth-token=${token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
    setIsAuthenticated(true)
    setUsername(username)
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setIsAuthenticated(false)
    setUsername(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, isLoading }}>
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
