import React, { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { Users, UserRound, Shuffle, Swords, Trophy, LogOut, ArrowLeft, Plus, Trash2, Edit2, Check, X, Upload, ChevronRight, RefreshCw, ExternalLink, Zap } from 'lucide-react'

// ── Utility ──────────────────────────────────────────────────────────────────
const COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#64748b','#0ea5e9','#84cc16','#e11d48']

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full border-2 transition-all ${value === c ? 'border-white scale-110' : 'border-transparent'}`}
          style={{ background: c }}/>
      ))}
    </div>
  )
}

function Badge({ status }) {
  const map = { aktiv:'bg-emerald-500/20 text-emerald-400', perfunduar:'bg-slate-500/20 text-slate-400', eliminuar:'bg-red-500/20 text-red-400', planifikuar:'bg-blue-500/20 text-blue-400', pending:'bg-amber-500/20 text-amber-400' }
  return <span className={`text-xs px-2 py-0.5 rounded-full ${map[status]||'bg-slate-500/20 text-slate-400'}`}>{status}</span>
}

// ── Teams Tab ─────────────────────────────────────────────────────────────────
function TeamsTab({ slug }) {
  const [teams, setTeams] = useState([])
  const [name, setName] = useState(''); const [color, setColor] = useState(COLORS[0])
  const [editing, setEditing] = useState(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => api.teams.list(slug).then(setTeams), [slug])
  useEffect(() => { load() }, [load])

  const add = async e => {
    e.preventDefault(); setErr('')
    try { await api.teams.create(slug, { name, color }); setName(''); load() }
    catch (e) { setErr(e.message) }
  }
  const del = async id => { if (!confirm('Fshi ekipin?')) return; await api.teams.delete(slug, id); load() }
  const saveEdit = async (id, n, c) => { await api.teams.update(slug, id, { name: n, color: c }); setEditing(null); load() }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Shto Ekip</h3>
        {err && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{err}</div>}
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500"
          placeholder="Emri i ekipit"/>
        <ColorPicker value={color} onChange={setColor}/>
        <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
          <Plus size={16}/> Shto Ekipin
        </button>
      </form>

      <div className="space-y-2">
        {teams.map(t => (
          <div key={t.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: t.color }}/>
            {editing?.id === t.id ? (
              <div className="flex-1 space-y-2">
                <input value={editing.name} onChange={e => setEditing(ed => ({...ed, name: e.target.value}))}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"/>
                <ColorPicker value={editing.color} onChange={c => setEditing(ed => ({...ed, color: c}))}/>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(t.id, editing.name, editing.color)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-xs text-white flex items-center gap-1"><Check size={12}/> Ruaj</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 rounded text-xs text-white flex items-center gap-1"><X size={12}/> Anulo</button>
                </div>
              </div>
            ) : (
              <>
                <span className="flex-1 text-white font-medium">{t.name}</span>
                <Badge status={t.status}/>
                <button onClick={() => setEditing({ id: t.id, name: t.name, color: t.color })} className="text-slate-400 hover:text-white p-1"><Edit2 size={14}/></button>
                <button onClick={() => del(t.id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 size={14}/></button>
              </>
            )}
          </div>
        ))}
        {teams.length === 0 && <div className="text-center text-slate-500 py-10">Nuk ka ekipe ende. Shto ekipet e para!</div>}
      </div>
    </div>
  )
}

// ── Players Tab ───────────────────────────────────────────────────────────────
function PlayersTab({ slug }) {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({ team_id: '', name: '', position: '', jersey_number: '' })
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const load = useCallback(() => {
    api.players.list(slug, filter ? `?team_id=${filter}` : '').then(setPlayers)
    api.teams.list(slug).then(setTeams)
  }, [slug, filter])
  useEffect(() => { load() }, [load])

  const add = async e => {
    e.preventDefault()
    try { await api.players.create(slug, form); setForm(f => ({...f, name:'',position:'',jersey_number:''})); load() }
    catch (e) { alert(e.message) }
  }
  const del = async id => { if (!confirm('Fshi lojtarin?')) return; await api.players.delete(slug, id); load() }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white">Shto Lojtar</h3>
        <select value={form.team_id} onChange={e => setForm(f=>({...f,team_id:e.target.value}))} required
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500">
          <option value="">-- Zgjidh Ekipin --</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500" placeholder="Emri"/>
          <input value={form.position} onChange={e=>setForm(f=>({...f,position:e.target.value}))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500" placeholder="Pozicioni"/>
        </div>
        <input type="number" value={form.jersey_number} onChange={e=>setForm(f=>({...f,jersey_number:e.target.value}))}
          className="w-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500" placeholder="Nr. Fanella"/>
        <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
          <Plus size={16}/> Shto Lojtarin
        </button>
      </form>

      <div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="mb-4 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
          <option value="">Të gjithë lojtarët</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-xs font-bold text-amber-400">{p.jersey_number || '-'}</span>
              <div className="flex-1">
                <div className="text-white font-medium">{p.name}</div>
                <div className="text-slate-400 text-xs">{p.team_name} {p.position && `• ${p.position}`}</div>
              </div>
              <button onClick={() => del(p.id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 size={14}/></button>
            </div>
          ))}
          {players.length === 0 && <div className="text-center text-slate-500 py-10">Nuk ka lojtarë ende.</div>}
        </div>
      </div>
    </div>
  )
}

// ── Rounds Tab ────────────────────────────────────────────────────────────────
function RoundsTab({ slug }) {
  const [rounds, setRounds] = useState([])
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [roundName, setRoundName] = useState('')

  const load = useCallback(() => api.rounds.list(slug).then(setRounds), [slug])
  useEffect(() => { load() }, [load])

  const doPreview = async () => {
    setErr(''); setLoading(true)
    try { const p = await api.rounds.drawPreview(slug); setPreview(p); setRoundName(p.round_name) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  const doConfirm = async () => {
    if (!preview) return; setLoading(true)
    try { await api.rounds.drawConfirm(slug, { pairs: preview.pairs, name: roundName }); setPreview(null); load() }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  const delRound = async id => {
    if (!confirm('Fshi rundën dhe të gjitha ndeshjet?')) return
    await api.rounds.delete(slug, id); load()
  }

  return (
    <div className="space-y-6">
      {err && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">{err}</div>}

      {!preview ? (
        <button onClick={doPreview} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50">
          <Shuffle size={18}/> {loading ? 'Duke bërë shortin...' : 'Bëj Shortin e Ri'}
        </button>
      ) : (
        <div className="bg-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Parapraju Short — {preview.team_count} ekipe</h3>
            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Emri i Rundës</label>
            <input value={roundName} onChange={e => setRoundName(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 text-sm w-full"/>
          </div>
          <div className="space-y-2">
            {preview.pairs.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${p.is_bye ? 'bg-slate-700/50' : 'bg-slate-700'}`}>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.home_team.color }}/> <span className="text-white text-sm">{p.home_team.name}</span>
                </div>
                {p.is_bye ? <span className="text-xs text-amber-400 px-3">BYE (kalon)</span> : (
                  <>
                    <span className="text-slate-500 text-xs">vs</span>
                    <div className="flex-1 flex items-center gap-2 justify-end">
                      <span className="text-white text-sm">{p.away_team.name}</span> <div className="w-3 h-3 rounded-full" style={{ background: p.away_team.color }}/>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={doPreview} disabled={loading} className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 rounded-lg text-sm flex items-center gap-2"><RefreshCw size={14}/> Risortë</button>
            <button onClick={doConfirm} disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center gap-2"><Check size={14}/> {loading ? 'Duke konfirmuar...' : 'Konfirmo Shortin'}</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rounds.map(r => (
          <div key={r.id} className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="font-bebas text-lg text-white">{r.name}</span>
                <Badge status={r.status}/>
              </div>
              <button onClick={() => delRound(r.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
            </div>
            {r.matches?.filter(m => !m.is_bye).map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-700/50 last:border-0 text-sm">
                <div className="flex-1 flex items-center gap-2 justify-end">
                  <span className={m.winner_id === m.home_team_id ? 'text-emerald-400 font-semibold' : 'text-white'}>{m.home_name}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.home_color }}/>
                </div>
                <span className="text-slate-400 font-mono text-xs px-2">
                  {m.home_score !== null && m.away_score !== null ? `${m.home_score} - ${m.away_score}` : 'vs'}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.away_color }}/>
                  <span className={m.winner_id === m.away_team_id ? 'text-emerald-400 font-semibold' : 'text-white'}>{m.away_name}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
        {rounds.length === 0 && <div className="text-center text-slate-500 py-10">Nuk ka raunde ende. Shto ekipet dhe bëj shortin!</div>}
      </div>
    </div>
  )
}

// ── Matches Tab ───────────────────────────────────────────────────────────────
function MatchCard({ slug, match, teams, players, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [scores, setScores] = useState({ home_score: match.home_score ?? '', away_score: match.away_score ?? '', home_pen: match.home_pen ?? '', away_pen: match.away_pen ?? '', match_date: match.match_date || '', match_time: match.match_time || '' })
  const [events, setEvents] = useState([])
  const [showEvents, setShowEvents] = useState(false)
  const [evForm, setEvForm] = useState({ team_id: match.home_team_id || '', player_id: '', event_type: 'goal', minute: '' })

  const loadEvents = () => { if (showEvents || !showEvents) api.matches.events.list(slug, match.id).then(setEvents) }
  useEffect(() => { loadEvents() }, [match.id])

  const save = async () => {
    try {
      await api.matches.update(slug, match.id, scores)
      setEditing(false); onUpdate()
    } catch (e) { alert(e.message) }
  }

  const addEvent = async e => {
    e.preventDefault()
    try { await api.matches.events.create(slug, match.id, evForm); loadEvents() } catch (e) { alert(e.message) }
  }
  const delEvent = async evId => { await api.matches.events.delete(slug, match.id, evId); loadEvents() }

  const homePlayers = players.filter(p => p.team_id === match.home_team_id)
  const awayPlayers = players.filter(p => p.team_id === match.away_team_id)
  const allPlayers = evForm.team_id ? players.filter(p => String(p.team_id) === String(evForm.team_id)) : []

  if (match.is_bye) return (
    <div className="bg-slate-800 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-slate-400">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: match.home_color }}/> <span className="text-white">{match.home_name}</span>
      <span className="ml-auto text-amber-400 text-xs">BYE — kalon automatikisht</span>
    </div>
  )

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className={`font-semibold ${match.winner_id === match.home_team_id ? 'text-emerald-400' : 'text-white'}`}>{match.home_name}</span>
            <div className="w-3 h-3 rounded-full" style={{ background: match.home_color }}/>
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg px-2 py-1">
            <input type="number" min={0} value={scores.home_score} onChange={e => setScores(s=>({...s, home_score: e.target.value}))}
              className="w-10 bg-transparent text-white text-center font-bold focus:outline-none"/>
            <span className="text-slate-400">-</span>
            <input type="number" min={0} value={scores.away_score} onChange={e => setScores(s=>({...s, away_score: e.target.value}))}
              className="w-10 bg-transparent text-white text-center font-bold focus:outline-none"/>
          </div>
        ) : (
          <div className="text-center min-w-[60px]">
            {match.home_score !== null && match.away_score !== null
              ? <span className="font-bebas text-2xl text-white">{match.home_score} - {match.away_score}</span>
              : <span className="text-slate-500 text-sm">vs</span>}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: match.away_color }}/>
            <span className={`font-semibold ${match.winner_id === match.away_team_id ? 'text-emerald-400' : 'text-white'}`}>{match.away_name}</span>
          </div>
        </div>

        <div className="flex gap-2 ml-2">
          {editing ? (
            <>
              <button onClick={save} className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white"><Check size={14}/></button>
              <button onClick={() => setEditing(false)} className="p-1.5 bg-slate-600 hover:bg-slate-700 rounded text-white"><X size={14}/></button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 border border-slate-600 hover:border-slate-400 rounded text-slate-400 hover:text-white"><Edit2 size={14}/></button>
          )}
          <button onClick={() => { setShowEvents(s => !s) }} className="p-1.5 border border-slate-600 hover:border-slate-400 rounded text-slate-400 hover:text-white text-xs"><Zap size={14}/></button>
        </div>
      </div>

      {editing && (
        <div className="px-5 pb-4 grid grid-cols-3 gap-3 border-t border-slate-700 pt-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Penaltia Shtëpi</label>
            <input type="number" min={0} value={scores.home_pen} onChange={e => setScores(s=>({...s,home_pen:e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"/>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Penaltia Mysafir</label>
            <input type="number" min={0} value={scores.away_pen} onChange={e => setScores(s=>({...s,away_pen:e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"/>
          </div>
          <div>
            <label className="text-slate-400 text-xs block mb-1">Ora</label>
            <input type="time" value={scores.match_time} onChange={e => setScores(s=>({...s,match_time:e.target.value}))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"/>
          </div>
        </div>
      )}

      {showEvents && (
        <div className="border-t border-slate-700 px-5 py-4">
          <div className="text-xs text-slate-400 mb-3 font-semibold uppercase">Ngjarjet</div>
          <div className="space-y-1 mb-4">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-400 w-8 text-right">{ev.minute ? `${ev.minute}'` : '-'}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">{ev.event_type}</span>
                <span className="text-white">{ev.player_name || '-'}</span>
                <span className="text-slate-500 text-xs">({ev.team_name})</span>
                <button onClick={() => delEvent(ev.id)} className="ml-auto text-slate-500 hover:text-red-400"><X size={12}/></button>
              </div>
            ))}
            {events.length === 0 && <div className="text-slate-500 text-xs">Nuk ka ngjarje.</div>}
          </div>
          <form onSubmit={addEvent} className="flex flex-wrap gap-2 items-end">
            <select value={evForm.team_id} onChange={e => setEvForm(f=>({...f,team_id:e.target.value,player_id:''}))}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:border-amber-500">
              <option value={match.home_team_id}>{match.home_name}</option>
              <option value={match.away_team_id}>{match.away_name}</option>
            </select>
            <select value={evForm.player_id} onChange={e => setEvForm(f=>({...f,player_id:e.target.value}))}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:border-amber-500">
              <option value="">-- Lojtar --</option>
              {allPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={evForm.event_type} onChange={e => setEvForm(f=>({...f,event_type:e.target.value}))}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:border-amber-500">
              {['goal','yellow_card','red_card','assist','penalty_miss','own_goal'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min={1} max={120} placeholder="Min" value={evForm.minute} onChange={e => setEvForm(f=>({...f,minute:e.target.value}))}
              className="w-16 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:border-amber-500"/>
            <button type="submit" className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-xs flex items-center gap-1">
              <Plus size={12}/> Shto
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function MatchesTab({ slug }) {
  const [rounds, setRounds] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [filter, setFilter] = useState('')
  const load = useCallback(async () => {
    const [r, t, p] = await Promise.all([api.rounds.list(slug), api.teams.list(slug), api.players.list(slug)])
    setRounds(r); setTeams(t); setPlayers(p)
  }, [slug])
  useEffect(() => { load() }, [load])

  const filtered = filter ? rounds.filter(r => String(r.id) === filter) : rounds

  return (
    <div className="space-y-6">
      <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
        <option value="">Të gjitha raundet</option>
        {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      {filtered.map(r => (
        <div key={r.id}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bebas text-xl text-white">{r.name}</h3>
            <Badge status={r.status}/>
          </div>
          <div className="space-y-2">
            {r.matches?.map(m => (
              <MatchCard key={m.id} slug={slug} match={m} teams={teams} players={players} onUpdate={load}/>
            ))}
          </div>
        </div>
      ))}
      {rounds.length === 0 && <div className="text-center text-slate-500 py-10">Nuk ka ndeshje ende. Bëj short-in te faqja Raundet!</div>}
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ slug, tournament, onUpdate }) {
  const [form, setForm] = useState({ name: tournament.name })
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(tournament.logo_path || null)
  const [loading, setLoading] = useState(false)

  const handleLogo = e => {
    const f = e.target.files[0]
    if (f) { setLogo(f); setPreview(URL.createObjectURL(f)) }
  }

  const save = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (logo) fd.append('logo', logo)
      await api.tournaments.update(slug, fd); onUpdate()
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={save} className="bg-slate-800 rounded-xl p-6 space-y-5 max-w-md">
      <h3 className="font-semibold text-white">Cilësimet e Turnirit</h3>
      <div>
        <label className="block text-sm text-slate-400 mb-2">Emri</label>
        <input value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))} required
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-amber-500"/>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-2">Logo</label>
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-amber-500 transition-colors relative overflow-hidden">
          {preview ? <img src={preview} className="absolute inset-0 w-full h-full object-contain p-2"/> :
            <div className="text-center"><Upload size={24} className="text-slate-500 mx-auto mb-2"/><span className="text-slate-500 text-sm">Ngarko logon</span></div>}
          <input type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
        </label>
      </div>
      <button type="submit" disabled={loading} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50">
        {loading ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
      </button>
    </form>
  )
}

// ── Main TournamentAdmin ──────────────────────────────────────────────────────
const TABS = [
  { id: 'teams', label: 'Ekipet', icon: <Users size={18}/> },
  { id: 'players', label: 'Lojtarët', icon: <UserRound size={18}/> },
  { id: 'rounds', label: 'Raundet / Short', icon: <Shuffle size={18}/> },
  { id: 'matches', label: 'Ndeshjet', icon: <Swords size={18}/> },
  { id: 'settings', label: 'Cilësimet', icon: <Trophy size={18}/> },
]

export default function TournamentAdmin() {
  const { slug } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('teams')
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const load = useCallback(() => {
    api.tournaments.get(slug).then(d => { setTournament(d.tournament); setLoading(false) }).catch(() => navigate('/dashboard'))
  }, [slug])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-5 border-b border-slate-700">
          <Link to="/" className="font-bebas text-2xl text-amber-500">TURN<span className="text-white">PLATFORM</span></Link>
          <div className="mt-3 flex items-center gap-3">
            {tournament.logo_path ? <img src={tournament.logo_path} className="w-10 h-10 object-contain rounded bg-slate-700 p-1"/> : <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center"><Trophy size={20} className="text-slate-500"/></div>}
            <div>
              <div className="text-white font-semibold text-sm truncate max-w-[140px]">{tournament.name}</div>
              <div className="text-slate-500 text-xs">/{tournament.slug}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${tab === t.id ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-1">
          <a href={`/t/${slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white text-sm rounded-xl hover:bg-slate-700 transition-colors">
            <ExternalLink size={16}/> Shiko Publik
          </a>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white text-sm rounded-xl hover:bg-slate-700 transition-colors">
            <ArrowLeft size={16}/> Paneli
          </Link>
          <button onClick={() => { logout(); navigate('/') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 text-sm rounded-xl hover:bg-slate-700 transition-colors">
            <LogOut size={16}/> Dil
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="font-bebas text-xl text-white">{TABS.find(t => t.id === tab)?.label}</span>
        </div>

        <div className="flex-1 p-6 max-w-3xl">
          <h2 className="font-bebas text-3xl text-white mb-6 hidden lg:block">{TABS.find(t => t.id === tab)?.label?.toUpperCase()}</h2>
          {tab === 'teams' && <TeamsTab slug={slug}/>}
          {tab === 'players' && <PlayersTab slug={slug}/>}
          {tab === 'rounds' && <RoundsTab slug={slug}/>}
          {tab === 'matches' && <MatchesTab slug={slug}/>}
          {tab === 'settings' && <SettingsTab slug={slug} tournament={tournament} onUpdate={load}/>}
        </div>
      </div>
    </div>
  )
}
