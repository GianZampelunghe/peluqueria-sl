import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
// Un token JWT anon genérico con estructura válida para que createClient no falle por firma o longitud
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1OTg4ODg4MDAsImV4cCI6MTkwODg4ODgwMH0.placeholder-signature';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'ADVERTENCIA: Las variables de entorno de Supabase no están configuradas en .env.local. Se utilizarán placeholders para compilar.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
