import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Trophy, Plus, ExternalLink, Settings, LogOut, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.tournaments.list(), api.orders.mine()])
      .then(([t, o]) => { setTournaments(t); setOrders(o); })
      .finally(() => setLoading(false))
  }, [])

  const pendingOrders = orders.filter(o => o.payment_status === 'pending')
  const confirmedUnused = orders.filter(o => o.payment_status === 'confirmed' && !tournaments.find(t => t.order_id === o.id))

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-bebas text-2xl text-amber-500">TURN<span className="text-white">PLATFORM</span></Link>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden md:block">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
            <LogOut size={16}/> Dil
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Pending payments */}
        {pendingOrders.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Clock size={20} className="text-amber-400 flex-shrink-0"/>
            <div>
              <div className="text-amber-400 font-semibold text-sm">Ke {pendingOrders.length} pagesë në pritje</div>
              <div className="text-slate-400 text-xs">Pasi administrali konfirmojë pagesën, do të mund të krijosh turnirin.</div>
            </div>
          </div>
        )}

        {/* Confirmed unused orders */}
        {confirmedUnused.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400"/>
              <div>
                <div className="text-emerald-400 font-semibold text-sm">Pagesa u konfirmua! Krijo turnirin tënd.</div>
                <div className="text-slate-400 text-xs">Plani: {confirmedUnused[0].plan} — {confirmedUnused[0].teams_limit} ekipe</div>
              </div>
            </div>
            <Link to={`/create?order=${confirmedUnused[0].id}`} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg text-sm transition-colors">
              Krijo Turnirin →
            </Link>
          </div>
        )}

        {/* Tournaments */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bebas text-4xl text-white">TURNIRET E MI</h1>
          <Link to="/pay" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors">
            <Plus size={18}/> Turnir i Ri
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={64} className="text-slate-700 mx-auto mb-4"/>
            <div className="text-slate-400 text-lg mb-2">Nuk ke ende turnirete</div>
            <div className="text-slate-500 text-sm mb-6">Kliko "Turnir i Ri" për të krijuar turnirin tënd të parë</div>
            <Link to="/pay" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors">Krijo Tani</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map(t => (
              <div key={t.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="h-32 bg-slate-700 flex items-center justify-center">
                  {t.logo_path ? <img src={t.logo_path} alt={t.name} className="h-28 w-full object-contain p-2"/>
                    : <Trophy size={48} className="text-slate-600"/>}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-white text-lg mb-1">{t.name}</div>
                  <div className="text-slate-500 text-xs mb-3">/{t.slug} • {t.teams_limit} ekipe maks</div>
                  <div className="flex gap-2">
                    <Link to={`/t/${t.slug}/admin`} className="flex-1 text-center py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                      <Settings size={14}/> Admin
                    </Link>
                    <a href={`/t/${t.slug}`} target="_blank" rel="noreferrer" className="px-3 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-1">
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
