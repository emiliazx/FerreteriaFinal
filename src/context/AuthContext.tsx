import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login as apiLogin, register as apiRegister, type AuthUser } from '../api/auth'

const TOKEN_KEY = 'ferreteria_token'
const USER_KEY = 'ferreteria_user'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  inicial: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (data: {
    nombre: string
    email: string
    password: string
  }) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInicial(u: AuthUser | null): string | null {
  if (!u) return null
  const fuente = u.nombre?.trim() || u.email?.trim() || ''
  return fuente ? fuente[0].toUpperCase() : '?'
}

function loadUser(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (!token || !raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.email && !parsed?.nombre) return null
    return { ...parsed, token }
  } catch {
    return null
  }
}

function persist(user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, user.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: user.userId,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    }),
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password)
    persist(u)
    setUser(u)
    return u
  }, [])

  const register = useCallback(
    async (data: {
      nombre: string
      email: string
      password: string
    }) => {
      const u = await apiRegister(data)
      persist(u)
      setUser(u)
      return u
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const inicial = useMemo(() => getInicial(user), [user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      inicial,
      login,
      register,
      logout,
    }),
    [user, inicial, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}