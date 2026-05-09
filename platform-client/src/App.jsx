import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { api, clearToken, setToken } from './api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'
import CreateTournament from './pages/CreateTournament'
import TournamentAdmin from './pages/TournamentAdmin'
import TournamentPublic from './pages/TournamentPublic'

/* ── Theme ─────────────────────────────────────────────────── */
export const ThemeCtx = createContext(null)
export function useTheme() { return useContext(ThemeCtx) }

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('turn_theme')
    const isDark = saved ? saved !== 'light' : true
    if (!isDark) document.documentElement.classList.add('light')
    return isDark
  })

  const toggle = () => setDark(d => {
    const next = !d
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('turn_theme', next ? 'dark' : 'light')
    return next
  })

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>
}

/* ── Global floating theme toggle ──────────────────────────── */
function FloatingThemeBtn() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={dark ? 'Modu i Ndritshëm' : 'Modu i Errët'}
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
               width: '44px', height: '44px', borderRadius: '50%',
               background: dark ? '#f59e0b' : '#1e293b',
               color: dark ? '#000' : '#f8fafc',
               border: 'none', cursor: 'pointer',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
               transition: 'background 0.2s, transform 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {dark ? <Sun size={20}/> : <Moon size={20}/>}
    </button>
  )
}

/* ── Auth ──────────────────────────────────────────────────── */
export const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => { api.auth.me().then(setUser).catch(() => setUser(null)) }, [])
  const login  = (data) => { setToken(data.token); setUser(data.user) }
  const logout = ()     => { clearToken(); setUser(null) }
  if (user === undefined) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
    </div>
  )
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

function Private({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <FloatingThemeBtn />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/dashboard"   element={<Private><Dashboard /></Private>} />
            <Route path="/pay"         element={<Private><Payment /></Private>} />
            <Route path="/create"      element={<Private><CreateTournament /></Private>} />
            <Route path="/t/:slug/admin/*" element={<Private><TournamentAdmin /></Private>} />
            <Route path="/t/:slug"     element={<TournamentPublic />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
