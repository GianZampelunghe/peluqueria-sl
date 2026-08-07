'use client';

import { Award, Sparkles, Star } from 'lucide-react';

const VIP_CUSTOMERS = [
  {
    name: 'Santiago Ascacíbar',
    cut: 'Mullet Urbano & Perfilado de Barba',
    details: 'Estudiantes de La Plata ⚽',
    badge: '🦁 Pincha',
    emoji: '⚽',
    gradient: 'from-red-950/50 via-zinc-900 to-zinc-950',
    borderColor: 'border-red-900/30 hover:border-red-700/50',
  },
  {
    name: 'Juan Foyth',
    cut: 'Mid Fade Clásico & Clean Shave',
    details: 'Villarreal / Selección Argentina 🏆',
    badge: '⭐ Campeón',
    emoji: '🏆',
    gradient: 'from-yellow-950/40 via-zinc-900 to-zinc-950',
    borderColor: 'border-yellow-900/30 hover:border-yellow-600/50',
  },
  {
    name: 'Matías Reali',
    cut: 'Buzz Cut & Degradado a la Piel',
    details: 'San Lorenzo de Almagro 🔵🔴',
    badge: '🔥 Ciclón',
    emoji: '⚡',
    gradient: 'from-blue-950/50 via-zinc-900 to-zinc-950',
    borderColor: 'border-blue-900/30 hover:border-blue-700/50',
  },
  {
    name: 'Francisco Charco',
    cut: 'Medium Length Despeinado & Textura',
    details: 'Líder de Cruzando el Charco 🎤',
    badge: '🎸 Artista',
    emoji: '🎤',
    gradient: 'from-purple-950/50 via-zinc-900 to-zinc-950',
    borderColor: 'border-purple-900/30 hover:border-purple-600/50',
  },
  {
    name: 'Mateo Gill',
    cut: 'High Fade con Línea & Perfilado',
    details: 'Futbolista Profesional ⚽',
    badge: '💈 Pro',
    emoji: '🔥',
    gradient: 'from-emerald-950/40 via-zinc-900 to-zinc-950',
    borderColor: 'border-emerald-900/30 hover:border-emerald-700/50',
  },
];

export default function Gallery() {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-gold text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4.5 h-4.5" /> Estilo Seleccionado
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Nuestros Clientes <span className="text-gold">VIP</span>
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" /> Corte Recomendado
        </div>
      </div>

      {/* Grid en desktop / Scroll horizontal en móvil */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-x-visible md:pb-0">
        {VIP_CUSTOMERS.map((customer, index) => (
          <div
            key={index}
            className={`min-w-[280px] md:min-w-0 bg-gradient-to-b ${customer.gradient} border ${customer.borderColor} rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 snap-center flex flex-col justify-between group`}
          >
            <div>
              {/* Header de Tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{customer.emoji}</span>
                <span className="px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-[10px] text-zinc-400 group-hover:text-gold group-hover:border-gold/30 transition-colors font-medium">
                  {customer.badge}
                </span>
              </div>

              {/* Título e Info */}
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold transition-colors duration-200">
                {customer.name}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 italic">
                {customer.details}
              </p>
            </div>

            {/* Tipo de corte */}
            <div className="pt-4 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider mb-1 font-bold">
                Corte Realizado
              </span>
              <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors duration-200">
                {customer.cut}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de scroll mobile */}
      <div className="flex justify-center gap-1.5 mt-4 md:hidden">
        {VIP_CUSTOMERS.map((_, index) => (
          <span
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-zinc-700"
          />
        ))}
      </div>
    </section>
  );
}
