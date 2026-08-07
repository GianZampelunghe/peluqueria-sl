'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';
import LoyaltyCRM from '@/components/LoyaltyCRM';
import { 
  Calendar, Clock, Plus, Trash2, Settings, Lock, LogOut, Save, RefreshCw, ChevronRight,
  Award, Phone
} from 'lucide-react';

interface Client {
  id: string;
  fullname: string;
  phone: string;
  cuts_completed: number;
  created_at: string;
}

interface Booking {
  id: string;
  client_id: string | null;
  fullname: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

interface DailySlot {
  id: string;
  date: string;
  time_slot: string;
  is_available: boolean;
}

export default function AdminPanel() {
  // Autenticación por PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [correctPin, setCorrectPin] = useState('1234');
  const [loginError, setLoginError] = useState('');

  // Configuración del sistema
  const [whatsappNumber, setWhatsappNumber] = useState('542216789012');
  const [cutsRequired, setCutsRequired] = useState(6);
  const [rewardText, setRewardText] = useState('¡7mo corte 100% GRATIS!');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Navegación de pestañas
  const [activeTab, setActiveTab] = useState<'agenda' | 'horarios' | 'crm' | 'ajustes'>('agenda');

  // Datos de la base de datos
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dailySlots, setDailySlots] = useState<DailySlot[]>([]);
  
  // Fechas activas de administración
  const [adminDate, setAdminDate] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
  });

  // Filtros y búsquedas
  const [crmSearch, setCrmSearch] = useState('');

  // Creación manual de slots
  const [newCustomTime, setNewCustomTime] = useState('');
  // Generador masivo de slots
  const [genStart, setGenStart] = useState('10:00');
  const [genEnd, setGenEnd] = useState('20:00');
  const [genInterval, setGenInterval] = useState(60);

  // Carga general de estados
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCRM, setLoadingCRM] = useState(false);
  
  // Validar sesión inicial por PIN
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    loadSystemSettings();
  }, []);

  // Cargar datos de configuración
  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'app_config')
        .single();
      
      if (data?.value) {
        const val = data.value as any;
        if (val.pin) setCorrectPin(val.pin);
        if (val.whatsapp_number) setWhatsappNumber(val.whatsapp_number);
        if (val.cuts_required) setCutsRequired(val.cuts_required);
        if (val.reward_text) setRewardText(val.reward_text);
      }
    } catch (err) {
      console.error('Error al cargar ajustes del sistema:', err);
    }
  };

  // Cargar datos según pestaña activa o cambio de fecha
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'agenda') {
      fetchBookings();
    } else if (activeTab === 'horarios') {
      fetchDailySlots();
    } else if (activeTab === 'crm') {
      fetchClients();
    }
  }, [isAuthenticated, activeTab, adminDate]);

  // Consultas de API Supabase
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', adminDate)
        .order('booking_time', { ascending: true });
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error al traer reservas:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchDailySlots = async () => {
    try {
      setLoadingSlots(true);
      const { data, error } = await supabase
        .from('daily_slots')
        .select('*')
        .eq('date', adminDate)
        .order('time_slot', { ascending: true });
      if (error) throw error;
      setDailySlots(data || []);
    } catch (err) {
      console.error('Error al traer horarios:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingCRM(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('cuts_completed', { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error al traer clientes:', err);
    } finally {
      setLoadingCRM(false);
    }
  };

  // Manejadores de Autenticación
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('PIN Incorrecto. Volvé a intentar.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPinInput('');
  };

  // Acciones en la Agenda
  const updateBookingStatus = async (bookingId: string, newStatus: 'completed' | 'cancelled' | 'pending') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Actualizar listado local de turnos
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      // Recargar CRM por si el trigger sumó cortes en segundo plano
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        fetchClients();
      }
    } catch (err) {
      console.error('Error al cambiar estado de reserva:', err);
      alert('Error al actualizar el estado del turno.');
    }
  };

  // Acciones en los Horarios (Slots)
  const handleAddCustomSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTime.trim()) return;

    // Validar formato simple HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newCustomTime)) {
      alert('Formato incorrecto. Debe ser HH:MM (Ej: 10:30 o 14:15)');
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_slots')
        .insert({
          date: adminDate,
          time_slot: newCustomTime.trim(),
          is_available: true
        });

      if (error) {
        if (error.code === '23505') {
          alert('Ese horario ya existe para esta fecha.');
        } else {
          throw error;
        }
      } else {
        setNewCustomTime('');
        fetchDailySlots();
      }
    } catch (err) {
      console.error('Error al agregar slot personalizado:', err);
    }
  };

  const handleDeleteSlot = async (slotId: string, timeSlot: string) => {
    // Comprobar si hay una reserva activa en ese slot
    const hasBooking = bookings.some(b => b.booking_time === timeSlot && b.status !== 'cancelled');
    if (hasBooking) {
      const confirmDelete = confirm('¡Atención! Hay un turno reservado activo en este horario. ¿Seguro que querés eliminarlo? Esto podría descolocar al cliente.');
      if (!confirmDelete) return;
    }

    try {
      const { error } = await supabase
        .from('daily_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      setDailySlots(prev => prev.filter(s => s.id !== slotId));
    } catch (err) {
      console.error('Error al borrar slot:', err);
    }
  };

  const handleToggleSlotAvailability = async (slotId: string, currentAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_slots')
        .update({ is_available: !currentAvailable })
        .eq('id', slotId);

      if (error) throw error;
      setDailySlots(prev => prev.map(s => s.id === slotId ? { ...s, is_available: !currentAvailable } : s));
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
    }
  };

  // Generador Masivo de Slots
  const handleGenerateSlots = async () => {
    const confirmGen = confirm(`Se generarán turnos para el día ${adminDate} desde las ${genStart} hasta las ${genEnd} cada ${genInterval} minutos. ¿Continuar?`);
    if (!confirmGen) return;

    try {
      setLoadingSlots(true);
      const slotsToInsert = [];
      let currentMinutes = timeToMinutes(genStart);
      const endMinutes = timeToMinutes(genEnd);

      while (currentMinutes <= endMinutes) {
        slotsToInsert.push({
          date: adminDate,
          time_slot: minutesToTime(currentMinutes),
          is_available: true
        });
        currentMinutes += Number(genInterval);
      }

      const { error } = await supabase
        .from('daily_slots')
        .upsert(slotsToInsert, { onConflict: 'date,time_slot' });

      if (error) throw error;
      
      fetchDailySlots();
    } catch (err) {
      console.error('Error generando slots en bloque:', err);
      alert('Error generando horarios en lote.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Utilidades de conversión de tiempos
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Modificar cortes manuales en CRM
  const handleAdjustCuts = async (clientId: string, currentCuts: number, direction: 'up' | 'down') => {
    const newValue = direction === 'up' ? currentCuts + 1 : Math.max(0, currentCuts - 1);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ cuts_completed: newValue })
        .eq('id', clientId);
      if (error) throw error;

      setClients(prev => prev.map(c => c.id === clientId ? { ...c, cuts_completed: newValue } : c));
    } catch (err) {
      console.error('Error ajustando cortes en cliente:', err);
    }
  };

  // Guardar Ajustes Generales
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsSuccess(false);

      const configValue = {
        pin: correctPin.trim(),
        whatsapp_number: whatsappNumber.replace(/\D/g, '').trim(),
        cuts_required: Number(cutsRequired),
        reward_text: rewardText.trim()
      };

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'app_config',
          value: configValue,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar ajustes en Supabase:', err);
      alert('Ocurrió un error al guardar los ajustes.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Formatear fechas para los encabezados de agenda
  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${weekdays[dateObj.getDay()]} ${day} de ${months[dateObj.getMonth()]}`;
  };

  // VISTA 1: LOGIN POR PIN SI NO ESTÁ AUTENTICADO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🔒</span>
            <h2 className="text-2xl font-black text-white">Panel Peluquería SL</h2>
            <p className="text-xs text-zinc-550 mt-1">Santiago, ingresá tu PIN de seguridad</p>
          </div>

          {loginError && (
            <div className="mb-4 bg-red-950/40 border border-red-900/50 text-red-200 text-xs p-3 rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={8}
                required
                placeholder="Introducir PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full py-4 text-center bg-zinc-950 border border-zinc-800 rounded-xl text-2xl tracking-widest text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gold hover:bg-gold-hover text-[#0F0F11] font-bold rounded-xl shadow-lg shadow-gold/10 transition-all flex items-center justify-center gap-1 cursor-pointer text-sm"
            >
              <span>Acceder al Panel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-zinc-650 hover:text-zinc-400 transition-colors">
              ← Volver a la Landing Pública
            </a>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: PANEL DE ADMINISTRACIÓN PRINCIPAL
  return (
    <div className="min-h-screen bg-[#0F0F11] flex flex-col">
      {/* Header Admin */}
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💈</span>
            <div>
              <h1 className="text-sm font-black text-white">PELUQUERÍA SL</h1>
              <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Santiago Admin Panel</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1E] border border-zinc-850 hover:border-red-900/50 hover:text-red-400 text-xs font-semibold text-zinc-400 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Navegación por pestañas móvil y desktop */}
      <div className="bg-zinc-950/50 border-b border-zinc-900 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between sm:justify-start gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'agenda' ? 'bg-gold text-[#0F0F11]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>
          
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'horarios' ? 'bg-gold text-[#0F0F11]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horarios Libres</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'crm' ? 'bg-gold text-[#0F0F11]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 animate-pulse" />
            <span>Fidelización CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('ajustes')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'ajustes' ? 'bg-gold text-[#0F0F11]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>

      {/* Contenedor de contenido central */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8">
        
        {/* FILTRO DE FECHAS GLOBAL PARA AGENDA Y HORARIOS */}
        {(activeTab === 'agenda' || activeTab === 'horarios') && (
          <div className="mb-6 bg-[#1A1A1E] border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-zinc-550 text-[10px] uppercase font-black tracking-wider">Fecha Seleccionada</span>
              <div className="text-sm font-bold text-white">
                {formatDateLabel(adminDate)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={adminDate}
                onChange={(e) => {
                  if (e.target.value) setAdminDate(e.target.value);
                }}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-gold"
              />
              <button
                onClick={() => {
                  if (activeTab === 'agenda') fetchBookings();
                  else if (activeTab === 'horarios') fetchDailySlots();
                }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Refrescar datos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: AGENDA DIARIA */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>📅 Turnos Agendados</span>
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded-full text-xs text-zinc-400 font-bold">
                  {bookings.length}
                </span>
              </h2>
            </div>

            <AdminDashboard 
              bookings={bookings} 
              loadingBookings={loadingBookings} 
              onUpdateStatus={updateBookingStatus} 
            />
          </div>
        )}

        {/* PESTAÑA: HORARIOS (SLOTS FLEXIBLES) */}
        {activeTab === 'horarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMNA 1: AGREGAR / GENERAR */}
            <div className="space-y-6">
              {/* Bloque: Agregar uno manual */}
              <div className="bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-850 pb-2">
                  ⏰ Agregar Horario Individual
                </h3>
                <form onSubmit={handleAddCustomSlot} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold mb-1.5 uppercase">
                      Hora del corte (Formato HH:MM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 11:30, 16:45"
                      value={newCustomTime}
                      onChange={(e) => setNewCustomTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-700 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gold hover:bg-gold-hover text-[#0F0F11] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-gold/5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar horario</span>
                  </button>
                </form>
              </div>

              {/* Bloque: Generador automático */}
              <div className="bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-850 pb-2">
                  ⚡ Generador Rápido de Horarios
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-550 font-bold mb-1 uppercase">Apertura</label>
                      <input
                        type="time"
                        value={genStart}
                        onChange={(e) => setGenStart(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-550 font-bold mb-1 uppercase">Cierre</label>
                      <input
                        type="time"
                        value={genEnd}
                        onChange={(e) => setGenEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-555 font-bold mb-1 uppercase">Intervalo (Minutos)</label>
                    <select
                      value={genInterval}
                      onChange={(e) => setGenInterval(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-gold"
                    >
                      <option value={30}>Cada 30 min (Ej: 10:00, 10:30)</option>
                      <option value={40}>Cada 40 min (Ej: 10:00, 10:40)</option>
                      <option value={45}>Cada 45 min (Ej: 10:00, 10:45)</option>
                      <option value={50}>Cada 50 min (Ej: 10:00, 10:50)</option>
                      <option value={60}>Cada 60 min (Ej: 10:00, 11:00)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateSlots}
                    className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-gold/30 text-zinc-350 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Generar Franja del Día</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA 2-3: LISTADO DE SLOTS */}
            <div className="lg:col-span-2 bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-850 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  📋 Lista de horarios del Día
                </h3>
                <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full">
                  {dailySlots.length} horarios creados
                </span>
              </div>

              {loadingSlots ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-6 w-6 border-b-2 border-gold mx-auto"></div>
                </div>
              ) : dailySlots.length === 0 ? (
                <div className="text-center py-16 text-zinc-550">
                  <span className="text-4xl block mb-2">🗓️</span>
                  <p className="text-sm font-bold">No hay horarios creados para hoy</p>
                  <p className="text-xs mt-1">Santiago, agrega horarios a mano o usa el generador rápido.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dailySlots.map((slot) => {
                    const isBooked = bookings.some(
                      (b) => b.booking_time === slot.time_slot && b.status !== 'cancelled'
                    );

                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
                          isBooked 
                            ? 'bg-yellow-950/10 border-yellow-900/30' 
                            : slot.is_available
                            ? 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                            : 'bg-red-950/10 border-red-900/30 opacity-70'
                        }`}
                      >
                        <div className="text-left">
                          <span className={`text-sm font-black block ${isBooked ? 'text-yellow-500' : 'text-white'}`}>
                            {slot.time_slot} hs
                          </span>
                          <span className="text-[9px] text-zinc-550 uppercase block font-bold">
                            {isBooked ? 'Reservado' : slot.is_available ? 'Habilitado' : 'Bloqueado'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isBooked && (
                            <button
                              onClick={() => handleToggleSlotAvailability(slot.id, slot.is_available)}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                slot.is_available
                                  ? 'bg-[#1A1A1E] border-zinc-800 text-zinc-400 hover:text-red-400'
                                  : 'bg-red-950/30 border-red-900 text-red-400 hover:text-emerald-400'
                              }`}
                              title={slot.is_available ? 'Bloquear horario' : 'Habilitar horario'}
                            >
                              <span className="text-[10px] block w-3.5 h-3.5 leading-none">
                                {slot.is_available ? '🚫' : '✓'}
                              </span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSlot(slot.id, slot.time_slot)}
                            className="p-1.5 bg-[#1A1A1E] hover:bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-red-500 rounded-lg cursor-pointer"
                            title="Eliminar horario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: CRM FIDELIZACIÓN & RANKING */}
        {activeTab === 'crm' && (
          <LoyaltyCRM 
            clients={clients} 
            loadingCRM={loadingCRM} 
            crmSearch={crmSearch} 
            setCrmSearch={setCrmSearch} 
            cutsRequired={cutsRequired} 
            rewardText={rewardText} 
            onAdjustCuts={handleAdjustCuts} 
          />
        )}

        {/* PESTAÑA: AJUSTES DE SISTEMA */}
        {activeTab === 'ajustes' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-base font-black text-white uppercase tracking-wider mb-6 border-b border-zinc-850 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold" />
                <span>Ajustes del Sistema</span>
              </h2>

              {settingsSuccess && (
                <div className="mb-6 bg-emerald-950/40 border border-emerald-900/60 text-emerald-250 text-xs p-3.5 rounded-xl text-center">
                  ✓ Ajustes guardados correctamente en Supabase.
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* 1. PIN */}
                <div>
                  <label className="block text-xs text-zinc-450 font-bold mb-1.5 uppercase">
                    PIN de Acceso Administrador
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1234"
                      value={correctPin}
                      onChange={(e) => setCorrectPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-550 mt-1">
                    PIN para bloquear/desbloquear esta sección.
                  </p>
                </div>

                {/* 2. Whatsapp de Destino */}
                <div>
                  <label className="block text-xs text-zinc-450 font-bold mb-1.5 uppercase">
                    Número de WhatsApp Comercial
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 542216789012"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-550 mt-1">
                    Número de celular con código de área del país (sin símbolos ni espacios) donde llegarán los turnos.
                  </p>
                </div>

                {/* 3. Cortes requeridos */}
                <div>
                  <label className="block text-xs text-zinc-450 font-bold mb-1.5 uppercase">
                    Cortes requeridos para el premio
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={cutsRequired}
                    onChange={(e) => setCutsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <p className="text-[10px] text-zinc-550 mt-1">
                    Cantidad de visitas que el cliente debe completar antes de ganar el beneficio.
                  </p>
                </div>

                {/* 4. Descripcion del premio */}
                <div>
                  <label className="block text-xs text-zinc-450 font-bold mb-1.5 uppercase">
                    Descripción del Premio
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ¡7mo corte gratis!"
                    value={rewardText}
                    onChange={(e) => setRewardText(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <p className="text-[10px] text-zinc-550 mt-1">
                    El texto de premio que se le mostrará a los clientes VIP.
                  </p>
                </div>

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full mt-4 py-3.5 bg-gold hover:bg-gold-hover disabled:bg-zinc-855 disabled:text-zinc-650 text-[#0F0F11] font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Guardando...' : 'Guardar Ajustes'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
