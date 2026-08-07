'use client';

import { Scissors, MapPin, MessageCircle, Instagram } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  whatsappNumber: string;
}

export default function Hero({ onBookClick, whatsappNumber }: HeroProps) {
  // Enlace oficial exacto a la ubicación de Google Maps de Peluquería SL
  const mapsLink = "https://www.google.com/maps/place/Peluquer%C3%ADa+SL/@-34.9403585,-57.9235045,763m/data=!3m2!1e3!4b1!4m6!3m5!1s0x95a2e920a34abbf7:0x825556dbf53f48e7!8m2!3d-34.9403585!4d-57.9209242!16s%2Fg%2F11ftm5wccq?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D";
  
  // Enlace directo a WhatsApp para consultas generales
  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  const whatsappContactLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("¡Hola Santiago! Te escribo para hacerte una consulta general sobre la barbería. 💈")}`;

  return (
    <section className="relative overflow-hidden pt-12 pb-14 px-4 md:py-20 max-w-4xl mx-auto text-center">
      {/* Efecto de fondo sutil con azul San Lorenzo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-sl/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      {/* Insignia superior */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-bold text-blue-sl mb-6">
        <span className="flex h-2.5 w-2.5 rounded-full bg-rojo-sl animate-pulse" />
        Barbería Profesional • Villa Elvira, La Plata
      </div>
      
      {/* Título Principal (San Lorenzo Colors) */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-blue-sl mb-4">
        PELUQUERÍA <span className="text-rojo-sl">SL</span>
      </h1>
      
      {/* Subtítulo descriptivo */}
      <p className="text-slate-655 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed font-medium">
        Dirigida por <span className="text-blue-sl font-extrabold">Santiago Lencina</span>. 
        Elevando tu estilo con cortes urbanos, clásicos y perfilado premium.
      </p>

      {/* Perfil del barbero */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <div className="relative w-14 h-14 rounded-full bg-white border-2 border-blue-sl flex items-center justify-center text-2xl shadow-md">
          💈
        </div>
        <div className="text-left">
          <p className="text-sm font-extrabold text-blue-sl">Santiago Lencina</p>
          <p className="text-xs text-slate-500 font-bold">Barbero Staff VIP</p>
        </div>
      </div>
      
      {/* Botones de Acción con Branding Específico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {/* Botón Reservar: Rojo San Lorenzo */}
        <button
          onClick={onBookClick}
          className="px-6 py-4 bg-rojo-sl hover:bg-rojo-sl-hover text-white font-black rounded-xl shadow-md shadow-rojo-sl/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer duration-200 text-sm"
        >
          <Scissors className="w-4.5 h-4.5" />
          <span>✂️ Reservar Turno</span>
        </button>
        
        {/* Botón Ubicación: Google Maps Oficial */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-4 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer duration-200 text-sm"
        >
          <MapPin className="w-4.5 h-4.5 text-[#EA4335] fill-[#EA4335]/10" />
          <span>📍 Cómo llegar (Villa Elvira)</span>
        </a>

        {/* Botón WhatsApp: Verde Oficial */}
        <a
          href={whatsappContactLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black rounded-xl shadow-md shadow-green-500/10 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer duration-200 text-sm"
        >
          <MessageCircle className="w-4.5 h-4.5 fill-white text-[#25D366]" />
          <span>💬 Escribir al WhatsApp</span>
        </a>
        
        {/* Botón Instagram */}
        <a
          href="https://instagram.com/peluqueria_sl"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-4 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer duration-200 text-sm"
        >
          <Instagram className="w-4.5 h-4.5 text-pink-650" />
          <span>📷 Instagram @peluqueria_sl</span>
        </a>
      </div>
    </section>
  );
}
