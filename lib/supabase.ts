
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Criar cliente apenas se variáveis estiverem disponíveis (modo offline se não estiver)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Flag para verificar se Supabase está disponível
export const isSupabaseAvailable = !!supabase;

// Log para debug (especialmente útil no iOS)
if (!supabase) {
  console.warn('⚠️ Supabase não disponível - app funcionará em modo offline com localStorage');
} else {
  console.log('✅ Supabase inicializado com sucesso');
}
