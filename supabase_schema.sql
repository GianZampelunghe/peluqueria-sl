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
-- Permite que un cliente reserve un horario previamente cancelado por otro.
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


-- 5. TRIGGER DE FIDELIZACIÓN AUTOMÁTICA
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

  -- Asegurarse de que el client_id en bookings esté sincronizado
  if new.client_id is null or new.client_id != client_id_found then
    new.client_id := client_id_found;
  end if;

  return new;
end;
$$ language plpgsql;

-- Crear trigger para la tabla bookings
create or replace trigger trg_booking_status_change
before insert or update on bookings
for each row
execute function handle_booking_status_change();
