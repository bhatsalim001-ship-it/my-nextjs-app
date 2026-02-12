"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { isAuthenticated, login as authLogin, logout as authLogout } from "@/lib/auth"

interface AuthContextType {
  authenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  const login = (username: string, password: string) => {
    const result = authLogin(username, password)
    if (result) setAuthenticated(true)
    return result
  }

  const logout = () => {
    authLogout()
    setAuthenticated(false)
  }

  return <AuthContext.Provider value={{ authenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
