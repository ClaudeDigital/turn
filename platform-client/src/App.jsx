import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { api, clearToken, setToken } from './api'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'
import CreateTournament from './pages/CreateTournament'
import TournamentAdmin from './pages/TournamentAdmin'
import TournamentPublic from './pages/TournamentPublic'

export const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    api.auth.me().then(setUser).catch(() => setUser(null))
  }, [])
  const login = async (data) => { setToken(data.token); setUser(data.user); }
  const logout = () => { clearToken(); setUser(null); }
  if (user === undefined) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/pay" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateTournament /></PrivateRoute>} />
          <Route path="/t/:slug/admin/*" element={<PrivateRoute><TournamentAdmin /></PrivateRoute>} />
          <Route path="/t/:slug" element={<TournamentPublic />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
