import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Trophy, Plus, ExternalLink, Settings, LogOut, Clock, CheckCircle, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.tournaments.list(), api.orders.mine()])
      .then(([t, o]) => { setTournaments(t); setOrders(o) })
      .finally(() => setLoading(false))
  }, [])

  const pending   = orders.filter(o => o.payment_status === 'pending')
  const confirmed = orders.filter(o => o.payment_status === 'confirmed' && !tournaments.find(t => t.order_id === o.id))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-bebas text-xl text-white tracking-widest">
          TURN<span className="text-amber-500">PLATFORM</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden md:block">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors">
            <LogOut size={15}/> Dil
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Pending payment notice */}
        {pending.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Clock size={18} className="text-amber-400 shrink-0 mt-0.5"/>
            <div>
              <p className="text-amber-300 text-sm font-semibold">Ke {pending.length} pagesë në pritje të konfirmimit</p>
              <p className="text-gray-500 text-xs mt-0.5">Pasi administrali konfirmojë pagesën, mund të krijosh turnirin.</p>
            </div>
          </div>
        )}

        {/* Confirmed, unused order */}
        {confirmed.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-400 shrink-0"/>
              <div>
                <p className="text-emerald-300 text-sm font-semibold">Pagesa u konfirmua! Tani mund të krijosh turnirin.</p>
                <p className="text-gray-500 text-xs mt-0.5">Plani: {confirmed[0].plan} — deri {confirmed[0].teams_limit} ekipe</p>
              </div>
            </div>
            <Link to={`/create?order=${confirmed[0].id}`}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all">
              Krijo <ChevronRight size={15}/>
            </Link>
          </div>
        )}

        {/* Tournaments */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-bebas text-3xl text-white tracking-wider">TURNIRET E MI</h1>
          <Link to="/pay"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus size={16}/> Turnir i Ri
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-12 text-center">
            <Trophy size={48} className="text-[#333] mx-auto mb-4"/>
            <p className="text-gray-500 text-sm mb-1">Nuk ke ende turnirete</p>
            <p className="text-gray-600 text-xs mb-6">Kliko "Turnir i Ri" për të krijuar turnirin tënd të parë</p>
            <Link to="/pay" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
              <Plus size={16}/> Krijo Tani
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map(t => (
              <div key={t.id} className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#333] transition-all">
                <div className="h-28 bg-[#0d0d0d] flex items-center justify-center border-b border-[#1a1a1a]">
                  {t.logo_path
                    ? <img src={t.logo_path} alt={t.name} className="h-24 w-full object-contain p-2"/>
                    : <Trophy size={40} className="text-[#333]"/>}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white mb-0.5 truncate">{t.name}</p>
                  <p className="text-gray-600 text-xs mb-4">/t/{t.slug} · {t.teams_limit} ekipe maks</p>
                  <div className="flex gap-2">
                    <Link to={`/t/${t.slug}/admin`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all">
                      <Settings size={14}/> Admin
                    </Link>
                    <a href={`/t/${t.slug}`} target="_blank" rel="noreferrer"
                      className="px-3 py-2 border border-[#2a2a2a] hover:border-[#444] text-gray-400 hover:text-white rounded-xl text-sm transition-all flex items-center">
                      <ExternalLink size={14}/>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
