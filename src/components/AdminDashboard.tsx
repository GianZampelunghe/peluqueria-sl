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
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="animate-spin h-6 w-6 border-b-2 border-blue-sl mx-auto"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <span className="text-4xl block mb-3">📭</span>
        <p className="text-sm text-slate-700 font-bold mb-1">Sin reservas para este día</p>
        <p className="text-xs text-slate-500">Los clientes que agenden online aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm ${
            booking.status === 'completed' 
              ? 'border-emerald-250 bg-emerald-50/15' 
              : booking.status === 'cancelled'
              ? 'border-slate-100 opacity-60 bg-slate-50/50'
              : 'border-slate-200'
          }`}
        >
          <div>
            {/* Cabecera del Turno */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-blue-sl text-xs font-black rounded-lg flex items-center gap-1.5 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-rojo-sl" /> {booking.booking_time} hs
              </span>
              
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                booking.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : booking.status === 'cancelled'
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {booking.status === 'completed' ? 'Completado ✓' : booking.status === 'cancelled' ? 'Cancelado ✗' : 'Pendiente'}
              </span>
            </div>

            {/* Detalles del Cliente */}
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-blue-sl font-extrabold text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span>{booking.fullname}</span>
              </div>
              <a
                href={`https://wa.me/${booking.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+{booking.phone} (Enviar WhatsApp)</span>
              </a>
            </div>
          </div>

          {/* Botones de Control de Estado */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
            {booking.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                className="flex-1 py-2.5 bg-emerald-550 hover:bg-emerald-650 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completar</span>
              </button>
            )}
            
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="px-3 py-2.5 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/50 hover:text-red-500 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}

            {booking.status !== 'pending' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'pending')}
                className="px-3 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
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
