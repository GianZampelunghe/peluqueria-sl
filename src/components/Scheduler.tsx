'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, User, Phone, CheckCircle, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react';

interface SchedulerProps {
  onSuccess: () => void;
}

export default function Scheduler({ onSuccess }: SchedulerProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appConfig, setAppConfig] = useState({
    whatsapp_number: '542216789012',
    cuts_required: 6,
    reward_text: '¡7mo corte 100% GRATIS!',
  });

  // Datos del negocio y reservas
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState<Record<string, string[]>>({});
  const [datesList, setDatesList] = useState<string[]>([]);
  
  // Selección del cliente
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [fullname, setFullname] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Estados de feedback
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Fecha, 2: Hora, 3: Formulario, 4: Confirmación
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdBooking, setCreatedBooking] = useState<{
    fullname: string;
    date: string;
    time: string;
  } | null>(null);

  // Formatear fechas para mostrar en la interfaz (Ej: "Lun 10 Ago")
  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${weekdays[dateObj.getDay()]} ${day} ${months[dateObj.getMonth()]}`;
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // 1. Cargar configuración de WhatsApp y Fidelización
      const { data: configData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'app_config')
        .single();
      
      if (configData?.value) {
        setAppConfig(configData.value as any);
      }

      // Obtener fecha actual en formato YYYY-MM-DD local
      const today = new Date();
      const tzOffset = today.getTimezoneOffset() * 60000;
      const todayStr = new Date(today.getTime() - tzOffset).toISOString().split('T')[0];

      // 2. Cargar todos los slots habilitados a partir de hoy
      const { data: slots, error: slotsError } = await supabase
        .from('daily_slots')
        .select('date, time_slot')
        .eq('is_available', true)
        .gte('date', todayStr);

      if (slotsError) throw slotsError;

      // 3. Cargar turnos activos (no cancelados) a partir de hoy
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_date, booking_time')
        .neq('status', 'cancelled')
        .gte('booking_date', todayStr);

      if (bookingsError) throw bookingsError;

      // Mapear turnos reservados para verificación rápida
      const reservedSlots = new Set<string>();
      bookings?.forEach(b => {
        reservedSlots.add(`${b.booking_date}_${b.booking_time}`);
      });

      // Agrupar slots disponibles por fecha
      const grouped: Record<string, string[]> = {};
      slots?.forEach(slot => {
        const slotKey = `${slot.date}_${slot.time_slot}`;
        if (!reservedSlots.has(slotKey)) {
          if (!grouped[slot.date]) {
            grouped[slot.date] = [];
          }
          grouped[slot.date].push(slot.time_slot);
        }
      });

      // Ordenar horarios en cada fecha
      const dates = Object.keys(grouped).sort();
      dates.forEach(d => {
        grouped[d].sort((a, b) => a.localeCompare(b));
      });

      setAvailableSlotsByDate(grouped);
      setDatesList(dates);

      // Si hay fechas disponibles, seleccionar la primera por defecto
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err: any) {
      console.error('Error cargando turnera:', err);
      setErrorMessage('Hubo un problema al cargar los turnos. Por favor, recargá la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reiniciar hora seleccionada al cambiar fecha
    setStep(2); // Avanzar a seleccionar hora
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3); // Avanzar al formulario de confirmación
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !phone.trim() || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '549' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('15')) {
      cleanPhone = '549' + cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('9')) {
      cleanPhone = '54' + cleanPhone;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      // Buscar si el cliente ya existe por número de teléfono
      let clientId: string | null = null;
      const { data: existingClient, error: clientSearchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (clientSearchError) throw clientSearchError;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Registrar nuevo cliente
        const { data: newClient, error: clientCreateError } = await supabase
          .from('clients')
          .insert({
            fullname: fullname.trim(),
            phone: cleanPhone,
            cuts_completed: 0,
          })
          .select('id')
          .single();

        if (clientCreateError) throw clientCreateError;
        clientId = newClient.id;
      }

      // Insertar el turno en bookings
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: clientId,
          fullname: fullname.trim(),
          phone: cleanPhone,
          booking_date: selectedDate,
          booking_time: selectedTime,
          status: 'pending',
        });

      if (bookingError) {
        if (bookingError.code === '23505') {
          throw new Error('Ese turno acaba de ser reservado por otra persona hace unos instantes. Por favor, selecciona otro horario.');
        }
        throw bookingError;
      }

      // Guardar datos para pantalla final
      setCreatedBooking({
        fullname: fullname.trim(),
        date: selectedDate,
        time: selectedTime,
      });

      setStep(4);
      onSuccess();
    } catch (err: any) {
      console.error('Error al reservar:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado al guardar el turno. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!createdBooking) return '';
    const dateLabel = formatDateLabel(createdBooking.date);
    const msg = `¡Hola Santiago! 👋 Acabo de reservar un turno en la Web:\n\n✂️ *Nombre:* ${createdBooking.fullname}\n📅 *Fecha:* ${dateLabel}\n⏰ *Hora:* ${createdBooking.time} hs\n\n¿Me confirmás el turno? ¡Muchas gracias! 🔥💈`;
    return `https://wa.me/${appConfig.whatsapp_number}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-sl mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Consultando agenda de Santiago...</p>
      </div>
    );
  }

  return (
    <div id="booking-section" className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative scroll-mt-6 text-slate-800">
      {/* Indicador de pasos */}
      {step < 4 && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="text-sm font-bold text-blue-sl">Reservá tu Turno</h3>
              <p className="text-[10px] text-slate-500">Peluquería SL • Rápido y directo</p>
            </div>
          </div>
          <div className="flex gap-1 text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-150 px-2 py-1 rounded-md">
            <span className={step === 1 ? 'text-rojo-sl' : ''}>Fecha</span>
            <span>/</span>
            <span className={step === 2 ? 'text-rojo-sl' : ''}>Hora</span>
            <span>/</span>
            <span className={step === 3 ? 'text-rojo-sl' : ''}>Datos</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PASO 1: SELECCIONAR FECHA */}
      {step === 1 && (
        <div>
          <label className="text-xs text-slate-450 uppercase tracking-wider font-extrabold mb-3 block">
            Paso 1: Seleccioná el Día
          </label>
          {datesList.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">💈</span>
              <p className="text-sm text-slate-700 font-bold mb-2">No hay fechas activas</p>
              <p className="text-xs text-slate-500 px-4">
                Santiago no ha habilitado turnos en los próximos días. Consultale directamente:
              </p>
              <a
                href={`https://wa.me/${appConfig.whatsapp_number}?text=Hola+Santiago!+Quiero+consultar+por+turnos+disponibles+para+cortarme.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rojo-sl hover:bg-rojo-sl-hover text-white font-bold text-xs rounded-lg transition-all"
              >
                Consultar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {datesList.map(date => {
                const availableCount = availableSlotsByDate[date]?.length || 0;
                return (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 hover:border-rojo-sl/30 hover:bg-rojo-sl/5 rounded-xl flex items-center justify-between text-left group transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4.5 h-4.5 text-blue-sl" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-sl transition-colors">
                        {formatDateLabel(date)}
                      </span>
                    </div>
                    <span className="text-[10px] bg-white text-slate-500 group-hover:text-rojo-sl px-2 py-1 rounded-md border border-slate-200 group-hover:border-rojo-sl/20 transition-all font-bold">
                      {availableCount} {availableCount === 1 ? 'disponible' : 'disponibles'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PASO 2: SELECCIONAR HORA */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
            >
              ← Volver a fechas
            </button>
            <span className="text-xs font-bold text-rojo-sl bg-rojo-sl/5 px-2 py-0.5 rounded-full border border-rojo-sl/10">
              {formatDateLabel(selectedDate)}
            </span>
          </div>

          <label className="text-xs text-slate-450 uppercase tracking-wider font-extrabold mb-3 block">
            Paso 2: Seleccioná el Horario
          </label>

          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {availableSlotsByDate[selectedDate]?.map(time => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className="py-3 bg-slate-50 border border-slate-200 hover:border-rojo-sl/40 hover:bg-rojo-sl/5 rounded-xl text-center font-extrabold text-sm text-slate-700 hover:text-blue-sl transition-all cursor-pointer"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 3: FORMULARIO */}
      {step === 3 && (
        <form onSubmit={handleBookingSubmit}>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
            >
              ← Volver a horarios
            </button>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              📅 {formatDateLabel(selectedDate)} - ⏰ {selectedTime} hs
            </span>
          </div>

          <label className="text-xs text-slate-450 uppercase tracking-wider font-extrabold mb-3 block">
            Paso 3: Tus Datos
          </label>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">
                Nombre y Apellido
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Thiago Silva"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">
                Número de WhatsApp (con código de área)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="Ej: 2216543210 (sin 15)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-4 bg-rojo-sl hover:bg-rojo-sl-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl shadow-md shadow-rojo-sl/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {submitting ? (
                <span>Reservando...</span>
              ) : (
                <>
                  <span>Confirmar Turno ✂️</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PASO 4: CONFIRMACIÓN Y REDIRECCIÓN */}
      {step === 4 && createdBooking && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-555 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          
          <h3 className="text-xl font-black text-blue-sl mb-2">¡Turno Reservado!</h3>
          <p className="text-sm text-slate-600 max-w-xs mx-auto mb-6">
            Hola <span className="text-slate-900 font-bold">{createdBooking.fullname}</span>, tu turno para el <span className="text-slate-900 font-bold">{formatDateLabel(createdBooking.date)}</span> a las <span className="text-slate-900 font-bold">{createdBooking.time} hs</span> fue registrado correctamente.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left text-xs text-slate-500 space-y-2 max-w-xs mx-auto">
            <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5 mb-1.5 flex items-center gap-1.5">
              <span>⚠️ IMPORTANTE: CONFIRMAR POR WHATSAPP</span>
            </p>
            <p className="leading-relaxed font-medium">
              Para asegurar tu lugar en la agenda física de Santiago, hacé clic en el botón de abajo para enviar la confirmación a su WhatsApp.
            </p>
          </div>

          {/* Botón WhatsApp oficial Verde */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black rounded-xl shadow-md shadow-green-500/20 items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
            <span>Confirmar en WhatsApp 📱</span>
          </a>
          
          <button
            onClick={() => {
              setStep(1);
              setFullname('');
              setPhone('');
              setSelectedTime('');
              fetchScheduleData();
            }}
            className="mt-4 text-xs text-slate-500 hover:text-slate-900 transition-colors font-bold cursor-pointer"
          >
            Reservar otro turno
          </button>
        </div>
      )}
    </div>
  );
}
