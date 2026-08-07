'use client';

import { useRef, useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import VIPGallery from '@/components/VIPGallery';
import Scheduler from '@/components/Scheduler';
import { supabase } from '@/lib/supabase';
import { Award, Scissors, Calendar, MapPin, Shield, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const schedulerRef = useRef<HTMLDivElement>(null);
  const [cutsRequired, setCutsRequired] = useState(6);
  const [rewardText, setRewardText] = useState('¡7mo corte 100% GRATIS!');

  useEffect(() => {
    // Cargar dinámicamente la configuración de fidelización para mostrarla en el banner
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'app_config')
          .single();
        if (data?.value) {
          const val = data.value as any;
          if (val.cuts_required) setCutsRequired(val.cuts_required);
          if (val.reward_text) setRewardText(val.reward_text);
        }
      } catch (err) {
        console.error('Error al cargar config en Home:', err);
      }
    };
    loadConfig();
  }, []);

  const scrollToScheduler = () => {
    schedulerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0F0F11]">
      {/* Navbar Minimalista */}
      <header className="sticky top-0 bg-[#0F0F11]/90 backdrop-blur-md border-b border-zinc-900 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💈</span>
            <span className="font-black tracking-wider text-white text-base">
              PELUQUERÍA <span className="text-gold">SL</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={scrollToScheduler}
              className="px-3.5 py-1.5 bg-gold/10 border border-gold/20 hover:border-gold text-gold text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Reservar Turno ✂️
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* Presentación Principal (Hero) */}
        <Hero onBookClick={scrollToScheduler} />

        {/* Galería de Trabajos a Clientes VIP */}
        <div className="border-t border-zinc-900 bg-zinc-950/20">
          <VIPGallery />
        </div>

        {/* Sección Banner Informativo de Fidelización */}
        <section className="py-10 px-4 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-zinc-900 to-[#1A1A1E] border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
            {/* Elemento de diseño de fondo */}
            <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-gold font-bold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/10">
                  <Award className="w-3.5 h-3.5" /> Club VIP Peluquería SL
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  Tarjeta de Fidelización Virtual
                </h3>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Registrate con tu WhatsApp al reservar. Con cada corte completado sumás una visita en el sistema de Santiago. ¡Al llegar a los <span className="text-white font-bold">{cutsRequired} cortes</span>, el siguiente es un regalo: <span className="text-gold font-bold">{rewardText}</span>!
                </p>
              </div>
              <div className="flex items-center gap-2 p-4 bg-zinc-950/80 border border-zinc-850 rounded-xl shrink-0 w-full md:w-auto justify-center">
                <div className="text-center">
                  <p className="text-2xl font-black text-gold">{cutsRequired} + 1</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Esquema de Regalo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Módulo de Reserva (Scheduler) */}
        <section ref={schedulerRef} className="py-12 px-4 border-t border-zinc-900 bg-zinc-950/30">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <span className="text-gold text-xs font-bold uppercase tracking-wider block mb-1">
              💈 Agenda Abierta
            </span>
            <h2 className="text-3xl font-black text-white">
              Elegí tu fecha y horario
            </h2>
            <p className="text-xs text-zinc-550 max-w-xs mx-auto mt-2">
              Seleccioná un día del calendario que tenga slots libres y agendá en 10 segundos.
            </p>
          </div>
          <Scheduler onSuccess={() => {}} />
        </section>

        {/* Información del Local */}
        <section className="py-12 px-4 max-w-4xl mx-auto border-t border-zinc-900 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-5 bg-[#1A1A1E] border border-zinc-850 rounded-xl flex flex-col items-center">
              <MapPin className="w-6 h-6 text-gold mb-3" />
              <h4 className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Ubicación</h4>
              <p className="text-sm font-semibold text-white">Villa Elvira, La Plata</p>
              <p className="text-[11px] text-zinc-550 mt-1">Calle 76 e/ 4 y 5</p>
            </div>
            
            <div className="p-5 bg-[#1A1A1E] border border-zinc-850 rounded-xl flex flex-col items-center">
              <Calendar className="w-6 h-6 text-gold mb-3" />
              <h4 className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Días de Atención</h4>
              <p className="text-sm font-semibold text-white">Martes a Sábados</p>
              <p className="text-[11px] text-zinc-550 mt-1">Habilitado dinámicamente</p>
            </div>

            <div className="p-5 bg-[#1A1A1E] border border-zinc-850 rounded-xl flex flex-col items-center">
              <Scissors className="w-6 h-6 text-gold mb-3" />
              <h4 className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Servicios</h4>
              <p className="text-sm font-semibold text-white">Corte, Barba & Diseños</p>
              <p className="text-[11px] text-zinc-550 mt-1">Estilo Urbano y Clásico</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer del Local */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-zinc-450 font-bold">
              © {new Date().getFullYear()} Peluquería SL. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Villa Elvira, La Plata, Buenos Aires • Santiago Lencina Barber.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1E] hover:bg-zinc-900 border border-zinc-850 rounded-lg text-xs text-zinc-500 hover:text-gold transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Acceso Santiago 🔒</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
