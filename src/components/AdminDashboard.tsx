'use client';

import { Clock, User, Phone, CheckCircle2, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  client_id: string | null;
  fullname: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface AdminDashboardProps {
  bookings: Booking[];
  loadingBookings: boolean;
  onUpdateStatus: (id: string, status: 'completed' | 'cancelled' | 'pending') => void;
}

export default function AdminDashboard({ 
  bookings, 
  loadingBookings, 
  onUpdateStatus 
}: AdminDashboardProps) {
  if (loadingBookings) {
    return (
      <div className="text-center py-12 bg-[#1A1A1E] border border-zinc-800 rounded-xl">
        <div className="animate-spin h-6 w-6 border-b-2 border-gold mx-auto"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-[#1A1A1E] border border-zinc-800 rounded-2xl">
        <span className="text-4xl block mb-3">📭</span>
        <p className="text-sm text-zinc-300 font-bold mb-1">Sin reservas para este día</p>
        <p className="text-xs text-zinc-550">Los clientes que agenden online aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className={`bg-[#1A1A1E] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
            booking.status === 'completed' 
              ? 'border-emerald-950/80 bg-emerald-950/5' 
              : booking.status === 'cancelled'
              ? 'border-zinc-900 opacity-60'
              : 'border-zinc-800'
          }`}
        >
          <div>
            {/* Cabecera del Turno */}
            <div className="flex items-center justify-between border-b border-zinc-850/60 pb-3 mb-3">
              <span className="px-3 py-1 bg-zinc-950 border border-zinc-850 text-gold text-xs font-black rounded-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" /> {booking.booking_time} hs
              </span>
              
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                booking.status === 'completed' 
                  ? 'bg-emerald-950 text-emerald-455 border border-emerald-900/50' 
                  : booking.status === 'cancelled'
                  ? 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  : 'bg-yellow-950/80 text-yellow-500 border border-yellow-900/30'
              }`}>
                {booking.status === 'completed' ? 'Completado ✓' : booking.status === 'cancelled' ? 'Cancelado ✗' : 'Pendiente'}
              </span>
            </div>

            {/* Detalles del Cliente */}
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{booking.fullname}</span>
              </div>
              <a
                href={`https://wa.me/${booking.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>+{booking.phone} (Enviar WhatsApp)</span>
              </a>
            </div>
          </div>

          {/* Botones de Control de Estado */}
          <div className="flex gap-2 pt-2 border-t border-zinc-855/50 mt-auto">
            {booking.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completar</span>
              </button>
            )}
            
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="px-3 py-2.5 bg-[#1A1A1E] border border-zinc-800 hover:border-red-900/40 hover:text-red-400 text-zinc-450 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}

            {booking.status !== 'pending' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'pending')}
                className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-350 text-xs font-bold rounded-xl cursor-pointer"
              >
                Pendiente
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
