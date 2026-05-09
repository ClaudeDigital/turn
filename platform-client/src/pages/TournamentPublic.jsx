import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { Trophy, Calendar, Users, ChevronDown, Shield } from 'lucide-react'

function MatchCard({ match }) {
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
    <div className="bg-[#111] border rounded-xl overflow-hidden border-[#222]">
      <div className="p-3">
        {(match.match_date || match.match_time) && (
          <div className="mb-2.5">
            <span className="text-xs text-gray-600">
              {match.match_date && new Date(match.match_date + 'T00:00:00').toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}
              {match.match_time && ` ${match.match_time}`}
            </span>
          </div>
        )}
        <div className="space-y-2">
          <TeamRow name={match.home_name} color={match.home_color} score={isPlayed ? match.home_score : null} winner={isHomeWinner} />
          <TeamRow name={match.away_name} color={match.away_color} score={isPlayed ? match.away_score : null} winner={isAwayWinner} />
        </div>
        {isPlayed && (match.home_pen != null || match.away_pen != null) && (
          <p className="text-xs text-gray-500 text-center mt-1.5">({match.home_pen} - {match.away_pen}) pas penaltive</p>
        )}
        {!isPlayed && (
          <div className="mt-2">
            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded-full">E planifikuar</span>
          </div>
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

export default function TournamentPublic() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openGroups, setOpenGroups] = useState(new Set())
  const [view, setView] = useState('ndeshjet')

  useEffect(() => {
    api.tournaments.getPublic(slug)
      .then(d => {
        setData(d)
        const active = d.rounds?.find(r => r.status === 'aktiv')
        if (active) setOpenGroups(new Set([active.id]))
        else if (d.rounds?.length > 0) setOpenGroups(new Set([d.rounds[d.rounds.length - 1].id]))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
      <div>
        <Trophy size={48} className="text-[#333] mx-auto mb-4" />
        <p className="text-gray-400 mb-2">{error}</p>
        <Link to="/" className="text-amber-400 hover:text-amber-300 text-sm">← Kthehu</Link>
      </div>
    </div>
  )

  const { tournament: t, teams, rounds } = data
  const champion = teams.find(tm => tm.status === 'kampion')
  const activeRound = rounds.find(r => r.status === 'aktiv')

  const toggleGroup = (id) => setOpenGroups(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* Header */}
      <div className="bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          {t.logo_path
            ? <img src={t.logo_path} alt={t.name} className="h-14 w-14 object-contain rounded-xl" />
            : <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center"><Trophy size={24} className="text-amber-500" /></div>}
          <div className="flex-1 min-w-0">
            <h1 className="font-bebas text-2xl text-white tracking-wide truncate">{t.name}</h1>
            <p className="text-xs text-gray-500">/t/{t.slug} · {activeRound?.name || 'Nuk ka xhiro aktive'}</p>
          </div>
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 shrink-0">
            TURN<span className="text-amber-500">PLATFORM</span>
          </Link>
        </div>

        {/* View tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-0">
          {[
            { id: 'ndeshjet', icon: Calendar, label: 'Ndeshjet' },
            { id: 'ekipet', icon: Shield, label: 'Ekipet' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                view === id ? 'text-amber-400 border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Champion banner */}
        {champion && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-5 text-center">
            <Trophy size={32} className="text-amber-500 mx-auto mb-2" />
            <p className="text-amber-400 font-bebas text-2xl tracking-wide">🏆 KAMPIONI</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: champion.color }} />
              <p className="text-white font-bold text-lg">{champion.name}</p>
            </div>
          </div>
        )}

        {/* Ndeshjet view */}
        {view === 'ndeshjet' && (
          <>
            {rounds.filter(r => r.status !== 'pending').length === 0 ? (
              <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-10 text-center">
                <Calendar size={36} className="mx-auto mb-3 text-[#333]" />
                <p className="text-gray-500 text-sm">Asnjë xhiro ende</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rounds.filter(r => r.status !== 'pending').map(round => (
                  <div key={round.id} className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                    <button onClick={() => toggleGroup(round.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="font-bebas text-lg text-white tracking-wide">{round.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          round.status === 'aktiv'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                        }`}>{round.status === 'aktiv' ? 'Aktive' : 'Përfunduar'}</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform ${openGroups.has(round.id) ? 'rotate-180' : ''}`} />
                    </button>
                    {openGroups.has(round.id) && (
                      <div className="px-3 pb-3 space-y-2">
                        {round.matches.map(m => <MatchCard key={m.id} match={m} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Ekipet view */}
        {view === 'ekipet' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {teams.length} Ekipe
              </p>
            </div>
            {teams.length === 0 ? (
              <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-10 text-center">
                <Users size={36} className="mx-auto mb-3 text-[#333]" />
                <p className="text-gray-500 text-sm">Asnjë ekip ende</p>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map(team => (
                  <div key={team.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: team.color || '#3b82f6' }} />
                    <span className="text-sm font-medium text-white flex-1">{team.name}</span>
                    {team.status === 'kampion' && <span className="text-xs text-amber-400">🏆 Kampion</span>}
                    {team.status === 'eliminuar' && <span className="text-xs text-gray-600">Eliminuar</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
