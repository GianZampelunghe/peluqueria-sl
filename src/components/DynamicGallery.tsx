'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Scissors, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
}


export default function DynamicGallery() {
  const [works, setWorks] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setWorks(data);
      } else {
        setWorks([]);
      }
    } catch (err) {
      console.error('Error cargando galería en frontend:', err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <section className="py-14 px-4 max-w-6xl mx-auto border-t border-slate-200">
      <div className="text-center mb-10">
        <span className="text-rojo-sl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4" /> Nuestros Estilos
        </span>
        <h2 className="text-3xl font-extrabold text-blue-sl">
          Algunos de mis trabajos
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2">
          Galería actualizada en tiempo real con los cortes más recientes realizados en el local.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-sl mx-auto"></div>
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <span className="text-4xl block mb-2">📹</span>
          <p className="text-sm font-bold text-slate-700">Próximamente más trabajos en video</p>
          <p className="text-xs mt-1">Estamos actualizando nuestra galería.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {works.map((work) => (
            <div
              key={work.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between"
            >
              {/* Imagen del corte */}
              <div className="relative aspect-[3/4] w-full h-80 sm:h-96 bg-slate-100 overflow-hidden flex items-center justify-center text-slate-300 group-hover:text-slate-400 transition-colors">
                {work.image_url ? (
                  work.image_url.toLowerCase().match(/\.(mp4|webm)$/i) ? (
                    <video src={work.image_url} autoPlay loop muted playsInline controls={false} className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={work.image_url}
                      alt={work.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback en caso de link de imagen roto
                        (e.target as any).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  )
                ) : (
                  <ImageIcon className="w-10 h-10" />
                )}
                {/* Badge de Categoría encima de la foto */}
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-blue-sl/90 text-white text-[10px] font-bold rounded-md border border-white/10 shadow-sm">
                  {work.category || 'Barbería'}
                </span>
              </div>

              {/* Título */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-1.5 text-blue-sl font-extrabold text-sm mb-0.5">
                  <Scissors className="w-3.5 h-3.5 text-rojo-sl shrink-0" />
                  <h3 className="truncate">{work.title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Por Santiago Lencina
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
