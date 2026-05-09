import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Shuffle, Users, Zap, Check } from 'lucide-react'

const plans = [
  { id:'mini',     name:'Mini',     price:5,  teams:8,  color:'border-[#2a2a2a]' },
  { id:'standard', name:'Standard', price:12, teams:16, color:'border-amber-500/50', popular: true },
  { id:'pro',      name:'Pro',      price:25, teams:32, color:'border-[#2a2a2a]' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex justify-between items-center">
        <span className="font-bebas text-2xl text-white tracking-widest">
          TURN<span className="text-amber-500">PLATFORM</span>
        </span>
        <div className="flex gap-3">
          <Link to="/login"    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Hyr</Link>
          <Link to="/register" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all">
            Fillo Tani
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs text-amber-500 font-bold tracking-widest uppercase mb-6">
          Platforma e Menaxhimit të Turnirave
        </p>
        <h1 className="font-bebas text-7xl md:text-9xl text-white leading-none mb-6">
          KRIJO<br/><span className="text-amber-500">TURNIRIN</span><br/>TËND
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
          Short automatik, bracket vizual, rezultate live — të gjitha në një platformë të thjeshtë.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all">
            Fillo Falas →
          </Link>
          <a href="/t/demo" className="px-8 py-3.5 border border-[#333] text-gray-300 hover:text-white hover:border-[#555] rounded-xl text-sm transition-all">
            Demo Live
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20 grid md:grid-cols-4 gap-4">
        {[
          { icon: <Shuffle size={20}/>, t:'Short Automatik', d:'Hedhja e shortit me animacion 3-2-1' },
          { icon: <Users size={20}/>, t:'Deri 32 Ekipe', d:'3 plane çmimesh sipas nevojës' },
          { icon: <Zap size={20}/>, t:'Bracket Live', d:'Pamja publike pa nevojë llogarie' },
          { icon: <Trophy size={20}/>, t:'Turnirete Shumë', d:'Krijo dhe menaxho sa të dëshirosh' },
        ].map((f,i) => (
          <div key={i} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="text-amber-500 mb-3">{f.icon}</div>
            <div className="font-semibold text-white text-sm mb-1">{f.t}</div>
            <div className="text-gray-500 text-xs">{f.d}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-bebas text-4xl text-white text-center mb-10 tracking-wider">ÇMIMET</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <div key={p.id} className={`bg-[#111] rounded-2xl p-6 border-2 relative ${p.color}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-black bg-amber-500 px-3 py-1 rounded-full uppercase tracking-wider">
                  Më Popular
                </span>
              )}
              <p className="font-bebas text-2xl text-white tracking-wider mb-1">{p.name}</p>
              <p className="text-4xl font-bold text-white mb-1">€{p.price}</p>
              <p className="text-gray-500 text-xs mb-5">për 1 turnir</p>
              <ul className="space-y-2 mb-6">
                {[`Deri ${p.teams} ekipe`, 'Short automatik', 'Bracket publik', 'Lojtarë & ngjarje', 'Eksport JSON'].map(f => (
                  <li key={f} className="flex gap-2 text-gray-300 text-sm">
                    <Check size={14} className="text-amber-500 mt-0.5 shrink-0"/> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all">
                Fillo Tani
              </Link>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-[#1a1a1a] py-8 text-center">
        <p className="font-bebas text-xl text-amber-500 tracking-widest mb-1">TURNPLATFORM</p>
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} — Krijo, Menaxho, Kampionizo</p>
      </footer>
    </div>
  )
}
