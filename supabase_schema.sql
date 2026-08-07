-- Peluquería SL - Supabase Database Schema
-- Script para ejecutar en la consola SQL (SQL Editor) de Supabase

-- 1. TABLA DE CONFIGURACIÓN DEL SISTEMA
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar configuración inicial por defecto
insert into settings (key, value) values (
  'app_config',
  '{"pin": "1234", "whatsapp_number": "542216789012", "cuts_required": 6, "reward_text": "¡7mo corte 100% GRATIS!"}'::jsonb
) on conflict (key) do nothing;


-- 2. TABLA DE CLIENTES (CRM)
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  fullname text not null,
  phone text unique not null, -- Número telefónico como identificador único (Formato WhatsApp)
  cuts_completed integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para búsqueda rápida de clientes
create index if not exists idx_clients_phone on clients (phone);


-- 3. TABLA DE TURNOS (BOOKINGS)
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete set null,
  fullname text not null,
  phone text not null,
  booking_date date not null,
  booking_time text not null, -- Formato "HH:MM" (ej: "10:00", "14:30")
  status text default 'pending'::text not null check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índice único parcial: Evita duplicar reservas activas (pendientes o completadas) para una misma fecha y hora.
create unique index if not exists unique_active_booking 
on bookings (booking_date, booking_time) 
where (status != 'cancelled');

-- Índices para optimizar consultas de turnos
create index if not exists idx_bookings_date_time on bookings (booking_date, booking_time);
create index if not exists idx_bookings_phone on bookings (phone);


-- 4. TABLA DE HORARIOS DIARIOS (FLEXIBLES Y DINÁMICOS)
create table if not exists daily_slots (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  time_slot text not null, -- Formato "HH:MM" (ej: "10:30")
  is_available boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_date_slot unique (date, time_slot)
);

-- Índices para optimizar búsquedas de franjas horarias por fecha
create index if not exists idx_daily_slots_date on daily_slots (date);


-- 5. TABLA DE GALERÍA DINÁMICA DE TRABAJOS
create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text, -- Tipo de corte (ej: "Fade", "Clásico", "Barba")
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar algunos trabajos de muestra por defecto
insert into gallery (title, category, image_url) values
('Fade Texturizado', 'Urbano ⚽', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80'),
('Buzz Cut & Línea', 'Tendencia 🔥', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80'),
('Perfilado de Barba', 'Detalle 💈', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80'),
('Corte Clásico Foyth', 'Selección 🏆', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80'),
('High Fade Diseñado', 'Urbano ⚡', 'https://images.unsplash.com/photo-1605497746445-97d1b0a9ead9?w=600&auto=format&fit=crop&q=80');


-- 6. TRIGGER DE FIDELIZACIÓN AUTOMÁTICA
-- Suma o resta automáticamente un corte al cliente según cambie el estado del turno.
create or replace function handle_booking_status_change()
returns trigger as $$
declare
  client_id_found uuid;
begin
  -- Buscar o registrar cliente en base al teléfono por si no se vinculó previamente
  select id into client_id_found from clients where phone = new.phone;
  
  if client_id_found is null then
    insert into clients (fullname, phone, cuts_completed)
    values (new.fullname, new.phone, 0)
    returning id into client_id_found;
  end if;

  -- Si el turno cambia a completado, sumamos un corte
  if (TG_OP = 'UPDATE' and new.status = 'completed' and old.status != 'completed') or (TG_OP = 'INSERT' and new.status = 'completed') then
    update clients
    set cuts_completed = cuts_completed + 1
    where id = client_id_found;
    
  -- Si el turno cambia de completado a otro estado (ej: cancelado), restamos el corte
  elsif (TG_OP = 'UPDATE' and old.status = 'completed' and new.status != 'completed') then
    update clients
    set cuts_completed = greatest(0, cuts_completed - 1)
    where id = client_id_found;
  end if;

  -- Sincronizar client_id en la tabla bookings
  if new.client_id is null or new.client_id != client_id_found then
    new.client_id := client_id_found;
  end if;

  return new;
end;
$$ language plpgsql;

-- Crear trigger
create or replace trigger trg_booking_status_change
before insert or update on bookings
for each row
execute function handle_booking_status_change();

-- 7. CONFIGURACIÓN DE STORAGE: BUCKET Y POLÍTICAS RLS para 'gallery-images'
-- Crear el bucket de storage si no existe
insert into storage.buckets (id, name, public) 
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

-- Crear políticas de acceso para el bucket 'gallery-images'

-- Permitir lectura pública a cualquiera
create policy "Lectura pública de galería" 
on storage.objects for select 
using (bucket_id = 'gallery-images');

-- Permitir inserción/subida a cualquiera
create policy "Subida de imágenes de galería" 
on storage.objects for insert 
with check (bucket_id = 'gallery-images');

-- Permitir eliminación
create policy "Eliminación de imágenes de galería" 
on storage.objects for delete 
using (bucket_id = 'gallery-images');
