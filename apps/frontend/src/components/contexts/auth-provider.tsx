import {
  useRef,
  useState,
  useEffect,
  useContext,
  createContext,
} from "react"
import { createClient } from "@openauthjs/openauth/client"
import type { AppRouter } from '../../../../trpc-api/src/index.js';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

const authClient = createClient({
  clientID: "auxarmory-frontend",
  issuer: "http://localhost:3001",
})

interface AuthContextType {
  userId?: string
  loaded: boolean
  loggedIn: boolean
  logout: () => void
  login: () => Promise<void>
  getToken: () => Promise<string | undefined>
}

const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializing = useRef(true)
  const [loaded, setLoaded] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const token = useRef<string | undefined>(undefined)
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    const hash = new URLSearchParams(location.search.slice(1))
    const code = hash.get("code")
    const state = hash.get("state")

    if (!initializing.current) {
      return
    }

    initializing.current = false

    if (code && state) {
      callback(code, state)
      return
    }

    auth()
  }, [])

  async function auth() {
    const token = await refreshTokens()

    if (token) {
      await user()
    }

    setLoaded(true)
  }

  async function refreshTokens() {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) return
    const next = await authClient.refresh(refresh, {
      access: token.current,
    })
    if (next.err) return
    if (!next.tokens) return token.current

    localStorage.setItem("refresh", next.tokens.refresh)
    token.current = next.tokens.access

    return next.tokens.access
  }

  async function getToken() {
    const token = await refreshTokens()

    if (!token) {
      await login()
      return
    }

    return token
  }

  async function login() {
    const { challenge, url } = await authClient.authorize(location.origin, "code", {
      pkce: true,
    })
    sessionStorage.setItem("challenge", JSON.stringify(challenge))
    location.href = url
  }

  async function callback(code: string, state: string) {
    const challenge = JSON.parse(sessionStorage.getItem("challenge")!)
    if (code) {
      if (state === challenge.state && challenge.verifier) {
        const exchanged = await authClient.exchange(
          code!,
          location.origin,
          challenge.verifier,
        )
        if (!exchanged.err) {
          token.current = exchanged.tokens?.access
          localStorage.setItem("refresh", exchanged.tokens.refresh)
        }
      }
      window.location.replace("/")
    }
  }

  async function user() {
    // Create a temporary tRPC client just for this call
    const client = createTRPCClient<AppRouter>({
      links: [httpBatchLink({
        url: 'http://localhost:3000',
        headers: {
          Authorization: `Bearer ${token.current}`,
        },
      })],
    });

    try {
      const id = await client.getUserId.query();
      setUserId(id);
      setLoggedIn(true);
    } catch {
      // If the query fails, we'll leave userId and loggedIn as is
      return;
    }
  }

  function logout() {
    localStorage.removeItem("refresh")
    token.current = undefined

    window.location.replace("/")
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        userId,
        loaded,
        loggedIn,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}