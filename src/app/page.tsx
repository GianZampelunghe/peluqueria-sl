'use client';

import { useRef, useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import DynamicGallery from '@/components/DynamicGallery';
import Scheduler from '@/components/Scheduler';
import { supabase } from '@/lib/supabase';
import { Award, Scissors, Calendar, MapPin, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const schedulerRef = useRef<HTMLDivElement>(null);
  const [cutsRequired, setCutsRequired] = useState(6);
  const [rewardText, setRewardText] = useState('¡7mo corte 100% GRATIS!');
  const [whatsappNumber, setWhatsappNumber] = useState('542216789012');

  useEffect(() => {
    // Cargar dinámicamente la configuración de fidelización para mostrarla en el banner y pasarla al Hero
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
          if (val.whatsapp_number) setWhatsappNumber(val.whatsapp_number);
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar Minimalista Light Mode */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-200 z-50 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-85 transition-all">
            <span className="text-xl group-hover:rotate-12 transition-transform">💈</span>
            <span className="font-black tracking-wider text-slate-800 text-base">
              PELUQUERÍA <span className="text-blue-sl">S</span><span className="text-rojo-sl">L</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <button
              onClick={scrollToScheduler}
              className="px-3.5 py-1.5 bg-rojo-sl hover:bg-rojo-sl-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-rojo-sl/10"
            >
              Reservar Turno ✂®
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* Presentación Principal (Hero) */}
        <Hero onBookClick={scrollToScheduler} whatsappNumber={whatsappNumber} />

        {/* Módulo de Reserva (Scheduler) */}
        <section ref={schedulerRef} className="py-12 px-4 border-t border-slate-200 bg-slate-100/50">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <span className="text-rojo-sl text-xs font-black uppercase tracking-wider block mb-1">
              💈 Agenda Abierta
            </span>
            <h2 className="text-3xl font-black text-blue-sl">
              Elegí tu fecha y horario
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2">
              Seleccioná un día del calendario que tenga horarios disponibles y agendá tu turno en 10 segundos.
            </p>
          </div>
          <Scheduler onSuccess={() => {}} />
        </section>

        {/* Galería de Trabajos Dinámica (Ahora al final) */}
        <div className="bg-white">
          <DynamicGallery />
        </div>

        {/* Información del Local */}
        <section className="py-14 px-4 max-w-4xl mx-auto border-t border-slate-200 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col items-center shadow-sm">
              <MapPin className="w-6 h-6 text-rojo-sl mb-3" />
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Ubicación</h4>
              <p className="text-sm font-extrabold text-blue-sl">Villa Elvira, La Plata</p>
              <p className="text-[11px] text-slate-500 mt-1">Calle 81 entre 9 bis y 10</p>
            </div>
            
            <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col items-center shadow-sm">
              <Calendar className="w-6 h-6 text-rojo-sl mb-3" />
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Días de Atención</h4>
              <p className="text-sm font-extrabold text-blue-sl">Martes a Sábados</p>
              <p className="text-[11px] text-slate-500 mt-1">(Sujeto a disponibilidad)</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col items-center shadow-sm">
              <Scissors className="w-6 h-6 text-rojo-sl mb-3" />
              <h4 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Servicios</h4>
              <p className="text-sm font-extrabold text-blue-sl">Corte, Barba & Diseños</p>
              <p className="text-[11px] text-slate-500 mt-1">Estilo Urbano y Clásico</p>
            </div>
          </div>
        </section>
      </main>

      {/* Sección de Redes Sociales (Instagram Destacado) */}
      <section className="py-8 px-4 text-center border-t border-slate-200 bg-slate-50/50">
        <div className="max-w-md mx-auto">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-black mb-3">Seguinos en nuestras redes 🦅</p>
          <a
            href="https://www.instagram.com/peluqueria_sl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full py-4.5 px-6 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-extrabold rounded-xl shadow-lg shadow-[#fd1d1d]/10 items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base md:text-lg"
          >
            <span>📷 Instagram @peluqueria_sl</span>
          </a>
        </div>
      </section>

      {/* Footer del Local Light */}
      <footer className="bg-slate-100 border-t border-slate-200 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-slate-600 font-bold">
              © {new Date().getFullYear()} Peluquería <span className="text-blue-sl">S</span><span className="text-rojo-sl">L</span>. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Calle 81 entre 9 bis y 10, Villa Elvira, La Plata • Santiago Lencina Barber.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
