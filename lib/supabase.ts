
import { createClient } from '@supabase/supabase-js';

// Tentar múltiplas formas de acessar variáveis de ambiente (compatibilidade iOS/Safari)
const getEnvVar = (key: string): string => {
  // Método 1: import.meta.env (Vite padrão)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }

  // Método 2: process.env (fallback)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Método 3: window (variáveis injetadas em runtime)
  if (typeof window !== 'undefined' && (window as any)[key]) {
    return (window as any)[key];
  }

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Debug detalhado para iOS
console.log('🔍 [Supabase Init] Verificando variáveis de ambiente...');
console.log('📱 User Agent:', navigator.userAgent);
console.log('🌐 URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'VAZIO');
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'VAZIO');

// Criar cliente apenas se variáveis estiverem disponíveis
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Flag para verificar se Supabase está disponível
export const isSupabaseAvailable = !!supabase;

// Log final
if (!supabase) {
  console.error('❌ [Supabase Init] FALHOU - app funcionará em modo offline');
  console.error('🔧 Verifique se as variáveis de ambiente estão configuradas no Vercel');
} else {
  console.log('✅ [Supabase Init] Sucesso!');
}
