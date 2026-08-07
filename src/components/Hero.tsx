'use client';

import { Scissors, MapPin, Instagram } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
}

export default function Hero({ onBookClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 px-4 md:py-24 max-w-4xl mx-auto text-center">
      {/* Efecto de fondo difuminado dorado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gold/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      {/* Insignia superior */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1A1A1E] border border-zinc-800 rounded-full text-xs font-semibold text-gold mb-6 animate-pulse-gold">
        <span className="flex h-2.5 w-2.5 rounded-full bg-gold" />
        Barbería Profesional • Villa Elvira
      </div>
      
      {/* Título Principal */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
        PELUQUERÍA <span className="text-gold">SL</span>
      </h1>
      
      {/* Subtítulo descriptivo */}
      <p className="text-zinc-400 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
        Dirigida por <span className="text-white font-semibold">Santiago Lencina</span>. 
        Elevando tu estilo con cortes urbanos, clásicos y perfilado premium.
      </p>

      {/* Perfil del barbero */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <div className="relative w-14 h-14 rounded-full bg-[#1A1A1E] border-2 border-gold flex items-center justify-center text-2xl shadow-lg">
          💈
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">Santiago Lencina</p>
          <p className="text-xs text-zinc-500">Barbero Staff VIP</p>
        </div>
      </div>
      
      {/* Botones de Acción (Responsive First) */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
        <button
          onClick={onBookClick}
          className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-hover text-[#0F0F11] font-bold rounded-xl shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer duration-200"
        >
          <Scissors className="w-5 h-5" />
          <span>✂️ Reservar Turno</span>
        </button>
        
        <a
          href="https://maps.google.com/?q=Villa+Elvira+La+Plata"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-4 bg-[#1A1A1E] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <MapPin className="w-5 h-5 text-gold" />
          <span>📍 Cómo llegar</span>
        </a>
        
        <a
          href="https://instagram.com/peluqueria_sl"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-4 bg-[#1A1A1E] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <Instagram className="w-5 h-5 text-pink-500" />
          <span>@peluqueria_sl</span>
        </a>
      </div>
    </section>
  );
}
