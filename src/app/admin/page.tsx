'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';
import LoyaltyCRM from '@/components/LoyaltyCRM';
import { 
  Calendar, Clock, Plus, Trash2, Settings, Lock, LogOut, Save, RefreshCw, ChevronRight,
  Award, Phone, Image as ImageIcon, Sparkles
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

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'agenda' | 'horarios' | 'crm' | 'galeria' | 'ajustes'>('agenda');

  // Datos de la base de datos
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dailySlots, setDailySlots] = useState<DailySlot[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  
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

  // Nuevo trabajo de Galería (Supabase Storage)
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryFilePreview, setGalleryFilePreview] = useState<string>('');
  const [savingGalleryItem, setSavingGalleryItem] = useState(false);

  // Carga general de estados
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCRM, setLoadingCRM] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);
  
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
    } else if (activeTab === 'galeria') {
      fetchGalleryItems();
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

  const fetchGalleryItems = async () => {
    try {
      setLoadingGallery(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Error al traer trabajos de galería:', err);
    } finally {
      setLoadingGallery(false);
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

  // Gestión de Galería Dinámica (Agregar con Supabase Storage)
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryFile) {
      alert('Por favor completa el título y selecciona una imagen.');
      return;
    }

    try {
      setSavingGalleryItem(true);
      
      // 1. Subir archivo a Supabase Storage bucket 'gallery-images'
      const fileExt = galleryFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = uniqueFileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, galleryFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Insertar registro en la tabla de base de datos
      const { data, error } = await supabase
        .from('gallery')
        .insert({
          title: galleryTitle.trim(),
          category: galleryCategory.trim() || 'Barbería',
          image_url: publicUrl
        })
        .select('*')
        .single();

      if (error) {
        // Si falla la inserción en DB, intentar borrar el archivo de storage para evitar huérfanos
        await supabase.storage.from('gallery-images').remove([filePath]);
        throw error;
      }

      // Actualizar listado local
      setGalleryItems(prev => [data, ...prev]);
      
      // Limpiar inputs y preview
      setGalleryTitle('');
      setGalleryCategory('');
      setGalleryFile(null);
      setGalleryFilePreview('');
      alert('Trabajo agregado con éxito a la galería.');
    } catch (err: any) {
      console.error('Error al agregar item de galería:', err);
      alert('Ocurrió un error al guardar el trabajo: ' + (err.message || err));
    } finally {
      setSavingGalleryItem(false);
    }
  };

  // Gestión de Galería Dinámica (Eliminar DB y Storage)
  const handleDeleteGalleryItem = async (itemId: string, imageUrl: string) => {
    const confirmDelete = confirm('¿Seguro que querés quitar este trabajo de la galería?');
    if (!confirmDelete) return;

    try {
      // 1. Extraer nombre de archivo desde la URL de la imagen
      const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

      if (fileName && !imageUrl.includes('unsplash.com')) { // Evitar borrar placeholders de unsplash
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([fileName]);

        if (storageError) {
          console.error('Error al remover archivo de Storage:', storageError);
        }
      }

      // 2. Eliminar registro de la base de datos
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setGalleryItems(prev => prev.filter(item => item.id !== itemId));
      alert('Trabajo eliminado correctamente.');
    } catch (err: any) {
      console.error('Error al eliminar item de galería:', err);
      alert('Ocurrió un error al eliminar el trabajo: ' + (err.message || err));
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🔒</span>
            <h2 className="text-2xl font-black text-blue-sl">Panel Peluquería SL</h2>
            <p className="text-xs text-slate-500 mt-1">Santiago, ingresá tu PIN de seguridad</p>
          </div>

          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl text-center font-semibold">
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
                placeholder="PIN (Pista: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full py-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-2xl tracking-widest text-slate-800 focus:border-blue-sl focus:outline-none transition-all font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rojo-sl hover:bg-rojo-sl-hover text-white font-bold rounded-xl shadow-md shadow-rojo-sl/10 transition-all flex items-center justify-center gap-1 cursor-pointer text-sm"
            >
              <span>Acceder al Panel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Botón de Pista de PIN visible solicitado para testing */}
          <div className="mt-4 p-2.5 bg-blue-sl/5 border border-blue-sl/10 rounded-xl text-center">
            <button
              onClick={() => setPinInput('1234')}
              className="text-xs text-blue-sl font-extrabold hover:underline"
            >
              🔑 Autocompletar PIN por defecto: 1234
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-slate-550 hover:text-blue-sl transition-colors font-bold">
              ← Volver a la Landing Pública
            </a>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: PANEL DE ADMINISTRACIÓN PRINCIPAL LIGHT
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Header Admin Light */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💈</span>
            <div>
              <h1 className="text-sm font-black text-blue-sl">PELUQUERÍA SL</h1>
              <p className="text-[10px] text-rojo-sl font-extrabold uppercase tracking-wider">Santiago Admin Panel</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-red-200 hover:text-rojo-sl text-xs font-bold text-slate-600 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Navegación por pestañas Light */}
      <div className="bg-white/80 border-b border-slate-200 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between sm:justify-start gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'agenda' ? 'bg-blue-sl text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>
          
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'horarios' ? 'bg-blue-sl text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horarios Libres</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'crm' ? 'bg-blue-sl text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Fidelización CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('galeria')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'galeria' ? 'bg-blue-sl text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gestor de Galería</span>
          </button>

          <button
            onClick={() => setActiveTab('ajustes')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
              activeTab === 'ajustes' ? 'bg-blue-sl text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
          <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Fecha Seleccionada</span>
              <div className="text-sm font-extrabold text-blue-sl">
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
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-sl"
              />
              <button
                onClick={() => {
                  if (activeTab === 'agenda') fetchBookings();
                  else if (activeTab === 'horarios') fetchDailySlots();
                }}
                className="p-2 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-lg text-slate-650 hover:text-blue-sl transition-all cursor-pointer"
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-blue-sl flex items-center gap-2">
                <span>📅 Turnos Agendados</span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 font-bold">
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
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  ⏰ Agregar Horario Individual
                </h3>
                <form onSubmit={handleAddCustomSlot} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1.5 uppercase">
                      Hora del corte (Formato HH:MM)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 11:30, 16:45"
                      value={newCustomTime}
                      onChange={(e) => setNewCustomTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none focus:ring-1 focus:ring-blue-sl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rojo-sl hover:bg-rojo-sl-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rojo-sl/5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar horario</span>
                  </button>
                </form>
              </div>

              {/* Bloque: Generador automático */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  ⚡ Generador Rápido de Horarios
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Apertura</label>
                      <input
                        type="time"
                        value={genStart}
                        onChange={(e) => setGenStart(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Cierre</label>
                      <input
                        type="time"
                        value={genEnd}
                        onChange={(e) => setGenEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Intervalo (Minutos)</label>
                    <select
                      value={genInterval}
                      onChange={(e) => setGenInterval(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-sl"
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
                    className="w-full py-3 bg-slate-100 border border-slate-200 hover:border-blue-sl/30 text-slate-700 hover:text-blue-sl font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Generar Franja del Día</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA 2-3: LISTADO DE SLOTS */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider">
                  📋 Lista de horarios del Día
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-250 px-2 py-0.5 rounded-full">
                  {dailySlots.length} horarios creados
                </span>
              </div>

              {loadingSlots ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-6 w-6 border-b-2 border-blue-sl mx-auto"></div>
                </div>
              ) : dailySlots.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <span className="text-4xl block mb-2">🗓️</span>
                  <p className="text-sm font-bold text-slate-700">No hay horarios creados para hoy</p>
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
                            ? 'bg-amber-50 border-amber-250' 
                            : slot.is_available
                            ? 'bg-slate-50 border-slate-200 hover:border-slate-350'
                            : 'bg-red-50 border-red-250 opacity-80'
                        }`}
                      >
                        <div className="text-left">
                          <span className={`text-sm font-black block ${isBooked ? 'text-amber-600' : 'text-slate-800'}`}>
                            {slot.time_slot} hs
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">
                            {isBooked ? 'Reservado' : slot.is_available ? 'Habilitado' : 'Bloqueado'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isBooked && (
                            <button
                              onClick={() => handleToggleSlotAvailability(slot.id, slot.is_available)}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                slot.is_available
                                  ? 'bg-white border-slate-200 text-slate-500 hover:text-red-500'
                                  : 'bg-red-100 border-red-200 text-red-500 hover:text-emerald-600'
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
                            className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-450 hover:text-red-500 rounded-lg cursor-pointer"
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

        {/* ======================================================== */}
        {/* PESTAÑA: GESTOR DE GALERÍA (NUEVO) */}
        {/* ======================================================== */}
        {activeTab === 'galeria' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulario de carga de nuevo trabajo */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit">
              <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-rojo-sl" />
                <span>Agregar Nuevo Trabajo</span>
              </h3>
              
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-550 font-bold mb-1.5 uppercase">
                    Título del Trabajo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Fade Clásico, Mullet Urbano"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-555 font-bold mb-1.5 uppercase">
                    Categoría / Subtítulo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Fade, Corte & Barba, Diseños"
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-555 font-bold mb-1.5 uppercase">
                    Imagen del Trabajo (Fototeca / Archivos)
                  </label>
                  
                  {galleryFilePreview && (
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 flex items-center justify-center shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={galleryFilePreview}
                        alt="Previsualización"
                        className="w-full h-full object-cover animate-fade-in"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryFile(null);
                          setGalleryFilePreview('');
                        }}
                        className="absolute top-2 right-2 bg-rojo-sl hover:bg-rojo-sl-hover text-white rounded-full p-1 shadow-md text-xs cursor-pointer font-bold w-6 h-6 flex items-center justify-center"
                        title="Quitar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <label className="w-full py-3.5 px-4 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-sl/50 hover:bg-blue-sl/5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 text-xs font-bold text-slate-600 hover:text-blue-sl shadow-sm">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>📷 Seleccionar foto de la fototeca</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setGalleryFile(file);
                          setGalleryFilePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  
                  {galleryFile && (
                    <p className="text-[10px] text-slate-500 mt-1.5 truncate">
                      Archivo: <span className="font-semibold text-slate-700">{galleryFile.name}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingGalleryItem}
                  className="w-full py-2.5 bg-rojo-sl hover:bg-rojo-sl-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rojo-sl/5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingGalleryItem ? 'Guardando...' : 'Agregar a la Galería'}</span>
                </button>
              </form>
            </div>

            {/* Listado y eliminación de trabajos */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4.5 h-4.5 text-blue-sl" />
                  <span>Galería de Trabajos ({galleryItems.length})</span>
                </h3>
              </div>

              {loadingGallery ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-6 w-6 border-b-2 border-blue-sl mx-auto"></div>
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <span className="text-4xl block mb-2">📸</span>
                  <p className="text-sm font-bold text-slate-700">No hay fotos en la galería</p>
                  <p className="text-xs mt-1">Usa el panel de la izquierda para subir el primer trabajo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm relative group flex flex-col justify-between"
                    >
                      <div className="aspect-square w-full bg-slate-100 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        {/* Botón de eliminación flotante */}
                        <button
                          onClick={() => handleDeleteGalleryItem(item.id, item.image_url)}
                          className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all"
                          title="Eliminar de galería"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="p-3 bg-white border-t border-slate-100">
                        <p className="font-extrabold text-xs text-blue-sl truncate">{item.title}</p>
                        <p className="text-[9px] text-slate-450 font-bold uppercase">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: AJUSTES DE SISTEMA */}
        {activeTab === 'ajustes' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-black text-blue-sl uppercase tracking-wider mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-sl" />
                <span>Ajustes del Sistema</span>
              </h2>

              {settingsSuccess && (
                <div className="mb-6 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs p-3.5 rounded-xl text-center font-bold shadow-sm animate-fade-in">
                  ✓ Ajustes guardados correctamente en Supabase.
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* 1. PIN */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase">
                    PIN de Acceso Administrador
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1234"
                      value={correctPin}
                      onChange={(e) => setCorrectPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-sl"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    PIN para bloquear/desbloquear esta sección.
                  </p>
                </div>

                {/* 2. Whatsapp de Destino */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase">
                    Número de WhatsApp Comercial
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 542216789012"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-sl"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Número de celular con código de área del país (sin símbolos ni espacios) donde llegarán los turnos.
                  </p>
                </div>

                {/* 3. Cortes requeridos */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase">
                    Cortes requeridos para el premio
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={cutsRequired}
                    onChange={(e) => setCutsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-sl"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    Cantidad de visitas que el cliente debe completar antes de ganar el beneficio.
                  </p>
                </div>

                {/* 4. Descripcion del premio */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase">
                    Descripción del Premio
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ¡7mo corte gratis!"
                    value={rewardText}
                    onChange={(e) => setRewardText(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-sl"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    El texto de premio que se le mostrará a los clientes VIP.
                  </p>
                </div>

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full mt-4 py-3.5 bg-rojo-sl hover:bg-rojo-sl-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-sm"
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
