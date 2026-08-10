'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Scissors, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  media_urls?: string[];
}

function GalleryCard({ work }: { work: GalleryItem }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determinar los medios a mostrar
  const mediaList = work.media_urls && work.media_urls.length > 0 ? work.media_urls : [work.image_url];
  const currentMedia = mediaList[currentIndex];
  
  const hasMultiple = mediaList.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between">
      {/* Imagen del corte */}
      <div className="relative aspect-[3/4] w-full h-80 sm:h-96 bg-slate-100 overflow-hidden flex items-center justify-center text-slate-300 group-hover:text-slate-400 transition-colors">
        {currentMedia ? (
          currentMedia.toLowerCase().match(/\.(mp4|webm)$/i) ? (
            <video src={currentMedia} autoPlay loop muted playsInline controls={false} className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentMedia}
              alt={work.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as any).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
              }}
            />
          )
        ) : (
          <ImageIcon className="w-10 h-10" />
        )}
        
        {/* Badge de Categoría encima de la foto */}
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-blue-sl/90 text-white text-[10px] font-bold rounded-md border border-white/10 shadow-sm z-10">
          {work.category || 'Barbería'}
        </span>

        {/* Controles del Carrusel */}
        {hasMultiple && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10">
              {mediaList.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
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
  );
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
            <GalleryCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </section>
  );
}
