import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { Trophy, Calendar, Users } from 'lucide-react'

function MatchRow({ m }) {
  if (m.is_bye) return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-700/30 rounded-lg text-sm text-slate-400">
      <div className="w-2 h-2 rounded-full" style={{ background: m.home_color }}/> {m.home_name}
      <span className="ml-auto text-amber-400 text-xs">BYE</span>
    </div>
  )
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/50 rounded-lg text-sm">
      <div className="flex-1 flex items-center gap-2 justify-end">
        <span className={`font-semibold ${m.winner_id === m.home_team_id ? 'text-emerald-400' : 'text-white'}`}>{m.home_name}</span>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.home_color }}/>
      </div>
      <div className="min-w-[56px] text-center bg-slate-800 rounded px-2 py-1">
        {m.home_score !== null && m.away_score !== null
          ? <span className="font-bebas text-lg text-white">{m.home_score}-{m.away_score}</span>
          : <span className="text-slate-500 text-xs">vs</span>}
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.away_color }}/>
        <span className={`font-semibold ${m.winner_id === m.away_team_id ? 'text-emerald-400' : 'text-white'}`}>{m.away_name}</span>
      </div>
    </div>
  )
}

export default function TournamentPublic() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.tournaments.getPublic(slug).then(setData).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>
  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-center">
      <div><Trophy size={64} className="text-slate-700 mx-auto mb-4"/><div className="text-slate-400 text-lg mb-4">Turniri nuk u gjet</div><Link to="/" className="text-amber-400 hover:underline">← Kthehu</Link></div>
    </div>
  )

  const { tournament, teams, rounds } = data
  const champion = (() => {
    if (!rounds.length) return null
    const last = rounds[rounds.length - 1]
    const final = last.matches?.find(m => !m.is_bye && !m.is_third_place)
    return final?.winner_id ? teams.find(t => t.id === final.winner_id) : null
  })()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center gap-6">
          {tournament.logo_path
            ? <img src={tournament.logo_path} className="w-20 h-20 object-contain rounded-xl bg-slate-700 p-2"/>
            : <div className="w-20 h-20 bg-slate-700 rounded-xl flex items-center justify-center"><Trophy size={36} className="text-amber-500"/></div>}
          <div>
            <h1 className="font-bebas text-5xl text-white">{tournament.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Users size={14}/> {teams.length} ekipe</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {rounds.length} raunde</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Champion banner */}
        {champion && (
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 rounded-2xl p-6 mb-10 text-center">
            <div className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">🏆 Kampioni</div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-amber-400" style={{ background: champion.color }}/>
              <span className="font-bebas text-5xl text-white">{champion.name}</span>
            </div>
          </div>
        )}

        {/* Rounds */}
        <div className="space-y-8">
          {rounds.map(r => (
            <div key={r.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bebas text-2xl text-white">{r.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'perfunduar' ? 'bg-slate-500/20 text-slate-400' : r.status === 'aktiv' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.status}</span>
              </div>
              <div className="space-y-2">
                {r.matches?.map(m => <MatchRow key={m.id} m={m}/>)}
              </div>
            </div>
          ))}
          {rounds.length === 0 && (
            <div className="text-center py-20">
              <Trophy size={64} className="text-slate-700 mx-auto mb-4"/>
              <div className="text-slate-400">Turniri nuk ka filluar ende. Rrini të sintonizuar!</div>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="mt-12">
          <h2 className="font-bebas text-3xl text-white mb-6">EKIPET</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teams.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.color }}/>
                <span className="text-white text-sm font-medium truncate">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="font-bebas text-xl text-amber-500 hover:text-amber-400 transition-colors">TURNPLATFORM</Link>
        </div>
      </div>
    </div>
  )
}
