import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth, useTheme } from '../App'
import {
  Home, Users, Calendar, Shuffle, Download, Settings, LogOut,
  Plus, X, Check, RefreshCw, Save, Pencil, Trash2, AlertCircle,
  ChevronDown, ExternalLink, Trophy, ArrowLeft, Sun, Moon
} from 'lucide-react'

/* ── Helpers ─────────────────────────────────────────────────── */
const COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#14b8a6',
  '#3b82f6','#8b5cf6','#ec4899','#f43f5e','#06b6d4',
  '#a3e635','#fb923c','#c084fc','#38bdf8','#4ade80','#f472b6',
]

function toast(msg, type = 'ok') {
  const div = document.createElement('div')
  div.className = `fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[999] px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border transition-all ${
    type === 'ok'
      ? 'bg-[#111] border-emerald-500/30 text-emerald-400'
      : 'bg-[#111] border-red-500/30 text-red-400'
  }`
  div.textContent = msg
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

/* ── Sidebar nav item ─────────────────────────────────────────── */
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
        active
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )
}

/* ── MatchCard ───────────────────────────────────────────────── */
function MatchCard({ match, onEdit }) {
  if (match.is_bye) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: match.home_color || '#3b82f6' }} />
          <span className="text-sm font-medium text-gray-300">{match.home_name}</span>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Kalon Automatikisht</span>
      </div>
    )
  }

  const isPlayed = match.status === 'perfunduar'
  const isHomeWinner = isPlayed && match.winner_id === match.home_team_id
  const isAwayWinner = isPlayed && match.winner_id === match.away_team_id

  return (
    <div onClick={() => onEdit && onEdit(match)}
      className={`bg-[#111] border rounded-xl overflow-hidden transition-all ${
        onEdit ? 'cursor-pointer hover:border-amber-500/40 hover:bg-[#151515]' : ''
      } ${isPlayed ? 'border-[#1f1f1f]' : 'border-[#222]'}`}>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-xs text-gray-500">{match.round_name || ''}</span>
          {match.match_date && (
            <span className="text-xs text-gray-600">
              · {new Date(match.match_date + 'T00:00:00').toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}
              {match.match_time && ` ${match.match_time}`}
            </span>
          )}
          {!isPlayed && onEdit && (
            <span className="ml-auto text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Fut rezultatin</span>
          )}
        </div>
        <div className="space-y-2">
          <TeamRow name={match.home_name} color={match.home_color} score={isPlayed ? match.home_score : null} winner={isHomeWinner} />
          <TeamRow name={match.away_name} color={match.away_color} score={isPlayed ? match.away_score : null} winner={isAwayWinner} />
        </div>
        {isPlayed && (match.home_pen != null || match.away_pen != null) && (
          <p className="text-xs text-gray-500 text-center mt-1.5">({match.home_pen} - {match.away_pen}) pas penaltive</p>
        )}
      </div>
    </div>
  )
}

function TeamRow({ name, color, score, winner }) {
  const c = color || '#3b82f6'
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c, boxShadow: winner ? `0 0 6px ${c}` : 'none' }} />
      <span className={`text-sm font-medium truncate flex-1 min-w-0 ${winner ? 'font-bold' : ''}`} style={{ color: winner ? c : '#d1d5db' }}>{name}</span>
      {score !== null && score !== undefined
        ? <span className={`font-bebas text-2xl leading-none shrink-0 min-w-[22px] text-right ${winner ? 'text-white' : 'text-gray-400'}`}>{score}</span>
        : <span className="font-bebas text-base leading-none shrink-0 text-gray-700">—</span>}
    </div>
  )
}

/* ── DrawModal (identical to turniri's Short.jsx DrawModal) ───── */
function DrawModal({ slug, onClose, onCreated, nextNumber }) {
  const [name, setName] = useState(`Xhiroja ${nextNumber}`)
  const [phase, setPhase] = useState('idle')
  const [pairs, setPairs] = useState([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [saving, setSaving] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [revealedCount])

  const fetchDraw = async () => {
    setPhase('loading')
    try {
      const data = await api.rounds.drawPreview(slug)
      setPairs(data.pairs)
      if (!name || name === `Xhiroja ${nextNumber}`) setName(data.round_name || `Xhiroja ${nextNumber}`)
      setCountdown(3)
      setRevealedCount(0)
      setPhase('countdown')
    } catch (e) {
      toast(e.message, 'err')
      setPhase('idle')
    }
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 900)
      return () => clearTimeout(t)
    }
    setPhase('revealing')
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'revealing') return
    if (revealedCount >= pairs.length) { setPhase('done'); return }
    const t = setTimeout(() => setRevealedCount(c => c + 1), 1800)
    return () => clearTimeout(t)
  }, [phase, revealedCount, pairs.length])

  const handleConfirm = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.rounds.drawConfirm(slug, { name: name.trim(), pairs })
      onCreated()
    } catch (e) {
      toast(e.message, 'err')
      setSaving(false)
    }
  }

  const canClose = phase === 'idle'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4" onClick={canClose ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div className="relative bg-[#0f0f0f]/95 md:bg-black/80 md:backdrop-blur-xl border border-[#252525] rounded-2xl w-full max-w-sm md:max-w-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>

        {phase === 'idle' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-xl text-white tracking-wide">XHIRO E RE</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="mb-5">
              <label className="block text-xs text-gray-500 mb-1.5">Emri i Xhiros</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <button onClick={fetchDraw} disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 py-3 rounded-xl text-sm transition-all mb-2">
              <Shuffle size={16} /> Hedh Shortin Automatikisht
            </button>
            <button onClick={onClose} className="w-full border border-[#2a2a2a] text-gray-400 hover:text-white rounded-xl py-2.5 text-sm transition-all">Anulo</button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Duke përzier ekipet...</p>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="p-12 flex flex-col items-center gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Shorti fillon pas</p>
            <div className="font-bebas text-9xl text-amber-500 leading-none animate-pulse select-none">{countdown}</div>
          </div>
        )}

        {(phase === 'revealing' || phase === 'done') && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Shorti</p>
                <h3 className="font-bebas text-lg text-white tracking-wide">{name}</h3>
              </div>
              <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded-full">{Math.min(revealedCount, pairs.length)}/{pairs.length}</span>
            </div>
            <div ref={listRef} className="space-y-2 max-h-72 md:max-h-[65vh] overflow-y-auto mb-4">
              {pairs.slice(0, revealedCount).map((pair, i) => (
                <div key={i} className="bg-[#1a1a1a]/80 border border-[#2a2a2a] rounded-xl px-3 py-2.5 md:px-5 md:py-4 animate-fade-in">
                  {pair.is_bye ? (
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0" style={{ backgroundColor: pair.home_team.color }} />
                      <span className="text-sm md:text-base text-gray-300 flex-1">{pair.home_team.name}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Kalon</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0" style={{ backgroundColor: pair.home_team.color }} />
                      <span className="text-sm md:text-base font-medium text-white flex-1 truncate">{pair.home_team.name}</span>
                      <span className="text-xs md:text-sm text-gray-600 font-bebas text-lg leading-none">VS</span>
                      <span className="text-sm md:text-base font-medium text-white flex-1 truncate text-right">{pair.away_team.name}</span>
                      <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shrink-0" style={{ backgroundColor: pair.away_team.color }} />
                    </div>
                  )}
                </div>
              ))}
              {phase === 'revealing' && revealedCount < pairs.length && (
                <div className="border border-amber-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border border-amber-500/40 border-t-amber-500 rounded-full animate-spin shrink-0" />
                  <span className="text-xs text-amber-500/70">Duke zbuluar çiftin tjetër...</span>
                </div>
              )}
            </div>
            {phase === 'revealing' && (
              <button onClick={onClose} className="w-full border border-[#333] text-gray-400 hover:text-white rounded-xl py-2.5 text-sm transition-all">Anulo</button>
            )}
            {phase === 'done' && (
              <div className="flex gap-2">
                <button onClick={onClose} className="border border-[#333] text-gray-400 hover:text-white rounded-xl py-2.5 px-4 text-sm transition-all">Anulo</button>
                <button onClick={fetchDraw} className="flex-1 border border-[#333] text-gray-400 hover:text-white rounded-xl py-2.5 text-sm transition-all flex items-center justify-center gap-1.5">
                  <RefreshCw size={14} /> Rifillo
                </button>
                <button onClick={handleConfirm} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl py-2.5 text-sm transition-all">
                  <Check size={15} /> {saving ? 'Duke ruajtur...' : 'Konfirmo & Ruaj'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── ResultModal ─────────────────────────────────────────────── */
function ResultModal({ match, slug, onClose, onSaved }) {
  const [hs, setHs] = useState(match.home_score ?? '')
  const [as_, setAs] = useState(match.away_score ?? '')
  const [hp, setHp] = useState(match.home_pen ?? '')
  const [ap, setAp] = useState(match.away_pen ?? '')
  const [date, setDate] = useState(match.match_date || '')
  const [time, setTime] = useState(match.match_time || '')
  const [saving, setSaving] = useState(false)
  const isTie = hs !== '' && as_ !== '' && parseInt(hs) === parseInt(as_)

  const save = async () => {
    setSaving(true)
    try {
      await api.matches.update(slug, match.id, {
        home_score: hs !== '' ? parseInt(hs) : null,
        away_score: as_ !== '' ? parseInt(as_) : null,
        home_pen: hp !== '' ? parseInt(hp) : null,
        away_pen: ap !== '' ? parseInt(ap) : null,
        match_date: date || null,
        match_time: time || null,
      })
      toast('Rezultati u ruajt!')
      onSaved()
    } catch (e) { toast(e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-[#111] border border-[#222] rounded-2xl w-full max-w-sm p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bebas text-xl text-white tracking-wide">REZULTATI</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-white truncate">{match.home_name}</span>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: match.home_color || '#3b82f6' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input type="number" min="0" value={hs} onChange={e => setHs(e.target.value)}
              className="w-14 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-center rounded-xl py-2.5 font-bebas text-2xl focus:outline-none focus:border-amber-500/50" />
            <span className="text-gray-600 font-bebas text-xl">-</span>
            <input type="number" min="0" value={as_} onChange={e => setAs(e.target.value)}
              className="w-14 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-center rounded-xl py-2.5 font-bebas text-2xl focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: match.away_color || '#3b82f6' }} />
              <span className="text-sm font-medium text-white truncate">{match.away_name}</span>
            </div>
          </div>
        </div>
        {isTie && (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">Penaltet (nëse barabarë)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={hp} onChange={e => setHp(e.target.value)} placeholder="0"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-center rounded-xl py-2 text-sm focus:outline-none focus:border-amber-500/50" />
              <span className="text-gray-600">-</span>
              <input type="number" min="0" value={ap} onChange={e => setAp(e.target.value)} placeholder="0"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-center rounded-xl py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Ora</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-[#333] text-gray-400 hover:text-white rounded-xl py-2.5 text-sm transition-all">Anulo</button>
          <button onClick={save} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl py-2.5 text-sm transition-all">
            <Save size={15} /> {saving ? 'Duke ruajtur...' : 'Ruaj'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Tabs ─────────────────────────────────────────────────────── */
const TABS = [
  { id: 'ballina',  icon: Home,     label: 'Ballina'  },
  { id: 'ekipet',   icon: Users,    label: 'Ekipet'   },
  { id: 'ndeshjet', icon: Calendar, label: 'Ndeshjet' },
  { id: 'xhirot',   icon: Shuffle,  label: 'Xhirot'   },
  { id: 'eksporto', icon: Download, label: 'Eksporto' },
  { id: 'cilesimet',icon: Settings, label: 'Cilësimet'},
]

/* ── Main Component ───────────────────────────────────────────── */
export default function TournamentAdmin() {
  const { slug } = useParams()
  const { user, logout } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('ballina')
  const [tournament, setTournament] = useState(null)
  const [teams, setTeams] = useState([])
  const [rounds, setRounds] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [tData, tms, rds, mts] = await Promise.all([
        api.tournaments.get(slug),
        api.teams.list(slug),
        api.rounds.list(slug),
        api.matches.list(slug),
      ])
      setTournament(tData.tournament || tData)
      setTeams(tms)
      setRounds(rds)
      setMatches(mts)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadAll() }, [loadAll])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/dashboard" className="text-amber-400 hover:text-amber-300 text-sm">← Kthehu</Link>
      </div>
    </div>
  )

  const t = tournament

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Mobile Topbar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d0d] border-b border-[#1a1a1a] flex items-center justify-between px-4 py-3">
        <span className="font-bebas text-base text-white tracking-wider truncate max-w-[70%]">{t?.name || 'TURNIRI'}</span>
        <div className="flex items-center gap-2">
          <a href={`/t/${slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-amber-400 rounded-lg transition-all">
            <ExternalLink size={16} />
          </a>
          <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-amber-400 rounded-lg transition-all">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex-col z-40">
        <div className="p-5 border-b border-[#1a1a1a]">
          {t?.logo_path
            ? <img src={t.logo_path} alt={t?.name} className="h-14 w-auto object-contain mx-auto mb-2" />
            : <div className="w-14 h-14 mx-auto mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center"><Trophy size={24} className="text-amber-500" /></div>}
          <p className="text-center text-xs text-gray-400 font-bebas tracking-wide leading-tight">{t?.name}</p>
          <p className="text-center text-[10px] text-gray-600 mt-0.5">/t/{t?.slug}</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {TABS.map(item => <NavItem key={item.id} {...item} active={tab === item.id} onClick={() => setTab(item.id)} />)}
        </nav>
        <div className="p-4 border-t border-[#1a1a1a]">
          <a href={`/t/${slug}`} target="_blank" rel="noreferrer"
            className="w-full flex items-center gap-2 px-4 py-2 mb-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ExternalLink size={15} /> Shiko Publik
          </a>
          <Link to="/dashboard"
            className="w-full flex items-center gap-2 px-4 py-2 mb-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={15} /> Paneli
          </Link>
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500">Pronar</p>
              </div>
            </div>
          )}
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-4 py-2 mb-1 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            {dark ? <><Sun size={16}/> Modu i Ndritshëm</> : <><Moon size={16}/> Modu i Errët</>}
          </button>
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={16} /> Dil
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="md:ml-64 pb-24 md:pb-8 pt-[52px] md:pt-0">
        <TabContent tab={tab} slug={slug} tournament={t} teams={teams} rounds={rounds} matches={matches} onRefresh={loadAll} />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0d0d0d] border-t border-[#1a1a1a] flex items-stretch">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-all ${
              tab === id ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <Icon size={20} />
            <span className="text-[10px] leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ── Tab Content Router ──────────────────────────────────────── */
function TabContent({ tab, slug, tournament, teams, rounds, matches, onRefresh }) {
  switch (tab) {
    case 'ballina':  return <TabBallina tournament={tournament} teams={teams} rounds={rounds} matches={matches} slug={slug} />
    case 'ekipet':   return <TabEkipet slug={slug} teams={teams} tournament={tournament} onRefresh={onRefresh} />
    case 'ndeshjet': return <TabNdeshjet slug={slug} matches={matches} rounds={rounds} onRefresh={onRefresh} />
    case 'xhirot':   return <TabXhirot slug={slug} rounds={rounds} teams={teams} onRefresh={onRefresh} />
    case 'eksporto': return <TabEksporto tournament={tournament} teams={teams} rounds={rounds} matches={matches} />
    case 'cilesimet':return <TabCilesimet slug={slug} tournament={tournament} onRefresh={onRefresh} />
    default: return null
  }
}

/* ── Tab: Ballina ─────────────────────────────────────────────── */
function TabBallina({ tournament, teams, rounds, matches, slug }) {
  const activeRound = rounds.find(r => r.status === 'aktiv')
  const played = matches.filter(m => m.status === 'perfunduar' && !m.is_bye).length
  const total = matches.filter(m => !m.is_bye).length
  const champion = teams.find(t => t.status === 'kampion')

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="font-bebas text-3xl text-white tracking-wider mb-6">{tournament?.name}</h1>

      {champion && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 text-center">
          <Trophy size={32} className="text-amber-500 mx-auto mb-2" />
          <p className="text-amber-400 font-bebas text-2xl tracking-wide">🏆 KAMPIONI</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: champion.color }} />
            <p className="text-white font-bold text-lg">{champion.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Ekipe', value: teams.length, max: `/ ${tournament?.teams_limit}` },
          { label: 'Xhiroja Aktive', value: activeRound?.name || '—', small: true },
          { label: 'Ndeshje', value: `${played}/${total}` },
        ].map(({ label, value, max, small }) => (
          <div key={label} className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`font-bebas text-white leading-tight ${small ? 'text-xl' : 'text-3xl'}`}>{value}
              {max && <span className="text-gray-600 text-lg">{max}</span>}
            </p>
          </div>
        ))}
      </div>

      {activeRound && (
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">{activeRound.name} — Ndeshjet aktive</p>
          <div className="space-y-2">
            {matches.filter(m => m.round_id === activeRound.id).map(m => (
              <MatchCard key={m.id} match={{ ...m, round_name: activeRound.name }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tab: Ekipet ─────────────────────────────────────────────── */
function TabEkipet({ slug, teams, tournament, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [editTeam, setEditTeam] = useState(null)
  const [saving, setSaving] = useState(false)

  const addTeam = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await api.teams.create(slug, { name: newName.trim(), color: newColor })
      setNewName('')
      setNewColor(COLORS[Math.floor(Math.random() * COLORS.length)])
      setShowAdd(false)
      await onRefresh()
      toast('Ekipi u shtua!')
    } catch (e) { toast(e.message, 'err') } finally { setSaving(false) }
  }

  const deleteTeam = async (id) => {
    if (!confirm('Fshi ekipin?')) return
    try {
      await api.teams.delete(slug, id)
      await onRefresh()
      toast('Ekipi u fshi!')
    } catch (e) { toast(e.message, 'err') }
  }

  const saveEdit = async () => {
    if (!editTeam?.name?.trim()) return
    setSaving(true)
    try {
      await api.teams.update(slug, editTeam.id, { name: editTeam.name, color: editTeam.color })
      setEditTeam(null)
      await onRefresh()
      toast('Ekipi u përditësua!')
    } catch (e) { toast(e.message, 'err') } finally { setSaving(false) }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bebas text-3xl text-white tracking-wider">EKIPET</h1>
          <p className="text-xs text-gray-500">{teams.length} / {tournament?.teams_limit} ekipe</p>
        </div>
        {teams.length < (tournament?.teams_limit || 99) && (
          <button onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus size={16} /> Shto Ekip
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-4 mb-4">
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1.5">Emri i Ekipit</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && addTeam()}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50"
              placeholder="Emri i ekipit..." />
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">Ngjyra</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#333] text-gray-400 rounded-xl py-2 text-sm">Anulo</button>
            <button onClick={addTeam} disabled={saving || !newName.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl py-2 text-sm">
              {saving ? '...' : 'Shto'}
            </button>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-10 text-center">
          <Users size={36} className="mx-auto mb-3 text-[#333]" />
          <p className="text-gray-500 text-sm">Asnjë ekip ende</p>
          <p className="text-xs text-gray-600 mt-1">Kliko "Shto Ekip" për të filluar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map(team => (
            <div key={team.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: team.color || '#3b82f6' }} />
              <span className="text-sm font-medium text-white flex-1">{team.name}</span>
              <button onClick={() => setEditTeam({ ...team })} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
              <button onClick={() => deleteTeam(team.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditTeam(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#111] border border-[#222] rounded-2xl w-full max-w-sm p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-xl text-white tracking-wide">EDITO EKIPIN</h3>
              <button onClick={() => setEditTeam(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">Emri</label>
              <input type="text" value={editTeam.name} onChange={e => setEditTeam(t => ({ ...t, name: e.target.value }))} autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">Ngjyra</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setEditTeam(t => ({ ...t, color: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${editTeam.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditTeam(null)} className="flex-1 border border-[#333] text-gray-400 rounded-xl py-2.5 text-sm">Anulo</button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl py-2.5 text-sm">
                <Check size={15} /> {saving ? '...' : 'Ruaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tab: Ndeshjet ───────────────────────────────────────────── */
function TabNdeshjet({ slug, matches, rounds, onRefresh }) {
  const [filterRound, setFilterRound] = useState('')
  const [editMatch, setEditMatch] = useState(null)
  const [openGroups, setOpenGroups] = useState(new Set())

  const filtered = filterRound ? matches.filter(m => m.round_id === parseInt(filterRound)) : matches
  const grouped = rounds.filter(r => r.status !== 'pending').map(r => ({
    round: r,
    matches: filtered.filter(m => m.round_id === r.id),
  })).filter(g => g.matches.length > 0)

  const toggleGroup = (id) => setOpenGroups(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  useEffect(() => {
    const active = rounds.find(r => r.status === 'aktiv')
    if (active) setOpenGroups(new Set([active.id]))
  }, [rounds])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bebas text-3xl text-white tracking-wider">NDESHJET</h1>
      </div>
      <div className="mb-4">
        <select value={filterRound} onChange={e => setFilterRound(e.target.value)}
          className="bg-[#111] border border-[#222] text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50">
          <option value="">Të gjitha xhirot</option>
          {rounds.filter(r => r.status !== 'pending').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      {grouped.length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-10 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-[#333]" />
          <p className="text-gray-500 text-sm">Asnjë ndeshje ende</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ round, matches: rms }) => (
            <div key={round.id} className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <button onClick={() => toggleGroup(round.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-bebas text-lg text-white tracking-wide">{round.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    round.status === 'aktiv' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                  }`}>{round.status === 'aktiv' ? 'Aktive' : 'Përfunduar'}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${openGroups.has(round.id) ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.has(round.id) && (
                <div className="px-3 pb-3 space-y-2">
                  {rms.map(m => (
                    <MatchCard key={m.id} match={{ ...m, round_name: round.name }}
                      onEdit={m.is_bye ? null : (match) => setEditMatch(match)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {editMatch && (
        <ResultModal match={editMatch} slug={slug} onClose={() => setEditMatch(null)}
          onSaved={async () => { setEditMatch(null); await onRefresh() }} />
      )}
    </div>
  )
}

/* ── Tab: Xhirot ─────────────────────────────────────────────── */
function TabXhirot({ slug, rounds, teams, onRefresh }) {
  const [showDraw, setShowDraw] = useState(false)

  const activeRound = rounds.find(r => r.status === 'aktiv') || null
  const activeTeams = teams.filter(t => t.status === 'aktiv' || !t.status)
  const allDone = activeRound
    ? (activeRound.matches || []).filter(m => !m.is_bye).every(m => m.status === 'perfunduar')
    : true
  const canCreate = !activeRound || allDone
  const nextNumber = rounds.filter(r => r.status !== 'pending').length + 1

  const deleteRound = async (id) => {
    if (!confirm('Fshi xhiron?')) return
    try {
      await api.rounds.delete(slug, id)
      await onRefresh()
      toast('Xhiroja u fshi!')
    } catch (e) { toast(e.message, 'err') }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bebas text-3xl text-white tracking-wider">XHIROT</h1>
        <button onClick={() => setShowDraw(true)} disabled={!canCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus size={16} /> Xhiro e Re
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs uppercase tracking-wider"><Users size={14} /> Ekipe</div>
          <p className="font-bebas text-3xl text-white">{activeTeams.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs uppercase tracking-wider"><Calendar size={14} /> Xhiroja Aktive</div>
          <p className="font-bebas text-2xl text-white leading-tight">{activeRound?.name || '—'}</p>
        </div>
      </div>

      {activeRound && !allDone && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300">Ka ndeshje të papërfunduara. Plotëso rezultatet para xhiros tjetër.</p>
        </div>
      )}

      {rounds.filter(r => r.status !== 'pending').length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-10 text-center text-gray-500">
          <Calendar size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Asnjë xhiro ende</p>
          <p className="text-xs mt-1">Kliko "Xhiro e Re" për të filluar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rounds.filter(r => r.status !== 'pending').map(r => (
            <div key={r.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{r.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(r.matches || []).filter(m => !m.is_bye).length} ndeshje · {(r.matches || []).filter(m => !m.is_bye && m.status === 'perfunduar').length} luajtur
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  r.status === 'aktiv' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                }`}>{r.status === 'aktiv' ? 'Aktive' : 'Përfunduar'}</span>
                <button onClick={() => deleteRound(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDraw && (
        <DrawModal slug={slug} nextNumber={nextNumber}
          onClose={() => setShowDraw(false)}
          onCreated={async () => { setShowDraw(false); await onRefresh(); toast('Xhiroja u krijua me shortin!') }} />
      )}
    </div>
  )
}

/* ── Tab: Eksporto ───────────────────────────────────────────── */
function TabEksporto({ tournament, teams, rounds, matches }) {
  const exportData = () => {
    const data = JSON.stringify({ tournament, teams, rounds, matches }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `${tournament?.slug || 'turniri'}-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="font-bebas text-3xl text-white tracking-wider mb-6">EKSPORTO</h1>
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Download size={22} className="text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Eksporto si JSON</p>
            <p className="text-sm text-gray-500">Shkarko të gjitha të dhënat e turnirit: ekipet, xhirot, ndeshjet dhe rezultatet.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[['Ekipe', teams.length], ['Xhiroja', rounds.length], ['Ndeshje', matches.filter(m => !m.is_bye).length]].map(([l, v]) => (
            <div key={l} className="bg-[#0d0d0d] rounded-xl p-3 text-center">
              <p className="font-bebas text-2xl text-white">{v}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
        <button onClick={exportData}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-3 rounded-xl text-sm transition-all">
          <Download size={16} /> Shkarko JSON
        </button>
      </div>
    </div>
  )
}

/* ── Tab: Cilësimet ─────────────────────────────────────────── */
function TabCilesimet({ slug, tournament, onRefresh }) {
  const [name, setName] = useState(tournament?.name || '')
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(tournament?.logo_path || null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const save = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (logo) fd.append('logo', logo)
      await api.tournaments.update(slug, fd)
      await onRefresh()
      toast('Turniri u përditësua!')
    } catch (e) { toast(e.message, 'err') } finally { setSaving(false) }
  }

  const deleteTournament = async () => {
    if (!confirm('Fshi turnirin përgjithmonë? Kjo nuk mund të kthehet!')) return
    setDeleting(true)
    try {
      await api.tournaments.delete(slug)
      navigate('/dashboard')
    } catch (e) { toast(e.message, 'err'); setDeleting(false) }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="font-bebas text-3xl text-white tracking-wider mb-6">CILËSIMET</h1>
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 mb-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Emri i Turnirit</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Logo</label>
          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#2a2a2a] hover:border-amber-500/40 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
            {preview
              ? <img src={logo ? preview : preview} className="absolute inset-0 w-full h-full object-contain p-2" />
              : <div className="text-center text-gray-600 text-xs">Kliko për të ngarkuar logon</div>}
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files[0]
              if (f) { setLogo(f); setPreview(URL.createObjectURL(f)) }
            }} />
          </label>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL Publike</label>
          <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#222] rounded-xl px-3 py-2">
            <span className="text-gray-600 text-sm">turn.gezimm.com/t/</span>
            <span className="text-amber-400 text-sm font-medium">{slug}</span>
            <a href={`/t/${slug}`} target="_blank" rel="noreferrer" className="ml-auto text-gray-500 hover:text-white">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 py-3 rounded-xl text-sm transition-all">
          <Save size={15} /> {saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
        </button>
      </div>
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <p className="text-red-400 font-semibold text-sm mb-1">Zona e Rrezikshme</p>
        <p className="text-gray-500 text-xs mb-4">Fshirja e turnirit është e pakthyeshme. Të gjitha të dhënat do të humbasin.</p>
        <button onClick={deleteTournament} disabled={deleting}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-sm transition-all">
          <Trash2 size={15} /> {deleting ? 'Duke fshirë...' : 'Fshi Turnirin'}
        </button>
      </div>
    </div>
  )
}
