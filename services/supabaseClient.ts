// Supabase client is now created dynamically per-branch via getSupabaseClient in config/branches.ts
// This file is kept for backward compatibility if anything still imports it,
// but all new code should import getSupabaseClient from '../config/branches' instead.

export { getSupabaseClient } from '../config/branches';
