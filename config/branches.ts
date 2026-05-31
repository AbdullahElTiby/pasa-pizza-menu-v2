// Branch configurations for Pasa Pizzeria
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const sharedSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const sharedSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!sharedSupabaseUrl || !sharedSupabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export interface BranchConfig {
  id: 'syria' | 'turkey';
  name: string;
  nameAr: string;
  nameTr: string;
  flag: string;
  currency: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export const BRANCHES: Record<string, BranchConfig> = {
  syria: {
    id: 'syria',
    name: 'Syria',
    nameAr: 'سوريا',
    nameTr: 'Suriye',
    flag: '🇸🇾',
    currency: 'SYP',
    supabaseUrl: sharedSupabaseUrl,
    supabaseKey: sharedSupabaseKey,
  },
  turkey: {
    id: 'turkey',
    name: 'Turkey',
    nameAr: 'تركيا',
    nameTr: 'Türkiye',
    flag: '🇹🇷',
    currency: 'TL',
    supabaseUrl: sharedSupabaseUrl,
    supabaseKey: sharedSupabaseKey,
  },
};

const clients: Record<string, SupabaseClient> = {};

export const getSupabaseClient = (branchId: string): SupabaseClient => {
  if (clients[branchId]) return clients[branchId];

  const branch = BRANCHES[branchId];
  if (!branch) throw new Error(`Unknown branch: ${branchId}`);

  clients[branchId] = createClient(branch.supabaseUrl, branch.supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: `sb-${branchId}-auth-token`,
    },
  });
  return clients[branchId];
};
