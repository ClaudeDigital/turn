import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Zap, Shield, Check } from 'lucide-react'

const plans = [
  { id: 'mini', name: 'Mini', price: 5, teams: 8, color: 'border-slate-500', badge: '' },
  { id: 'standard', name: 'Standard', price: 12, teams: 16, color: 'border-amber-500', badge: 'MË POPULAR' },
  { id: 'pro', name: 'Pro', price: 25, teams: 32, color: 'border-emerald-500', badge: 'PROFESIONAL' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <span className="font-bebas text-3xl text-amber-500">TURN<span className="text-white">PLATFORM</span></span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Hyr</Link>
          <Link to="/register" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">Regjistrohu</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-24 px-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-sm px-4 py-2 rounded-full mb-8 border border-amber-500/30">
          <Trophy size={14} /> Platforma Nr.1 e Turnirave
        </div>
        <h1 className="font-bebas text-7xl md:text-9xl text-white mb-4 leading-none">
          KRIJO<br/><span className="text-amber-500">TURNIRIN</span><br/>TËND
        </h1>
        <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10">Menaxho turniret me eliminim direkt. Short automatik, rezultate live, bracket vizual — e gjitha në një vend.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-lg transition-colors">Fillo Falas →</Link>
          <Link to="/t/demo" className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-white rounded-xl text-lg transition-colors">Shiko Demo</Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
        {[
          { icon: <Trophy size={24}/>, title: 'Short Automatik', desc: 'Shortim i rastit me 1 klik' },
          { icon: <Users size={24}/>, title: 'Deri 32 Ekipe', desc: 'Mini, Standard ose Pro' },
          { icon: <Zap size={24}/>, title: 'Rezultate Live', desc: 'Bracket vizual publik' },
          { icon: <Shield size={24}/>, title: 'Turnirete të Shumta', desc: 'Krijo sa të dëshirosh' },
        ].map((f, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-amber-500 flex justify-center mb-3">{f.icon}</div>
            <div className="font-semibold text-white mb-1">{f.title}</div>
            <div className="text-slate-400 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-bebas text-5xl text-center text-white mb-12">ÇMIMET</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.id} className={`bg-slate-800 rounded-2xl p-8 border-2 ${p.color} relative`}>
              {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">{p.badge}</span>}
              <div className="font-bebas text-3xl text-white mb-2">{p.name}</div>
              <div className="text-5xl font-bold text-white mb-1">€{p.price}</div>
              <div className="text-slate-400 text-sm mb-6">për 1 turnir</div>
              <ul className="space-y-2 mb-8">
                {[`Deri ${p.teams} ekipe`, 'Short automatik', 'Bracket vizual publik', 'Lojtarë & ngjarje', 'Eksport JSON'].map(f => (
                  <li key={f} className="flex gap-2 text-slate-300 text-sm"><Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5"/>{f}</li>
                ))}
              </ul>
              <Link to="/register" className="block text-center py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors">Fillo Tani</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <span className="font-bebas text-xl text-amber-500 block mb-2">TURNPLATFORM</span>
        © {new Date().getFullYear()} TurnPlatform — Krijo, Menaxho, Kampionizo
      </footer>
    </div>
  )
}
