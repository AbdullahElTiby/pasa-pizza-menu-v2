import { getSupabaseClient } from '../config/branches';

export const login = async (branchId: string, email: string, password: string): Promise<boolean> => {
  const supabase = getSupabaseClient(branchId);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return false;
  }

  return !!data.session;
};

export const logout = async (branchId: string): Promise<void> => {
  const supabase = getSupabaseClient(branchId);
  await supabase.auth.signOut();
};

export const checkAuth = async (branchId: string): Promise<boolean> => {
  const supabase = getSupabaseClient(branchId);
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};
