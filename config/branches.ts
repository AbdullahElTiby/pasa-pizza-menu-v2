// Branch configurations for Pasa Pizzeria
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    supabaseUrl: 'https://kapwaawpzuwnffgcoeyb.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcHdhYXdwenV3bmZmZ2NvZXliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ4NzA2MCwiZXhwIjoyMDkzMDYzMDYwfQ._z2_WskLeVsMEFjv5uyDwKnIYAih4Qx2abBY4GEhb8Y',
  },
  turkey: {
    id: 'turkey',
    name: 'Turkey',
    nameAr: 'تركيا',
    nameTr: 'Türkiye',
    flag: '🇹🇷',
    currency: 'TL',
    supabaseUrl: 'https://adlkrhskhpvbpgptdcmd.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbGtyaHNraHB2YnBncHRkY21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE3MDkwMiwiZXhwIjoyMDc5NzQ2OTAyfQ.4bwa9KLPVNbF6EJJbsXXvCGjDSnGKFcdYTdH5NOiV9I',
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
