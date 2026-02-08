import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const buildSupabaseEntityApi = (tableName) => ({
  list: async (sort, limit) => {
    let query = supabase.from(tableName).select('*');
    
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.slice(1) : sort;
      query = query.order(field, { ascending: !isDesc });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  
  filter: async (filters, sort, limit) => {
    let query = supabase.from(tableName).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.slice(1) : sort;
      query = query.order(field, { ascending: !isDesc });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  
  create: async (payload) => {
    const { data, error } = await supabase
      .from(tableName)
      .insert([payload])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id, payload) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
});

export const base44 = {
  entities: {
    Branch: buildSupabaseEntityApi('Branch'),
    Cleaner: buildSupabaseEntityApi('Cleaner'),
    Complaint: buildSupabaseEntityApi('Complaint'),
    Notification: buildSupabaseEntityApi('Notification'),
    SalaryLog: buildSupabaseEntityApi('SalaryLog')
  },
  auth: {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: 'admin'
      };
    },
    logout: async () => {
      await supabase.auth.signOut();
    },
    redirectToLogin: () => {
      // For now, just reload - we'll add proper auth UI later
      window.location.reload();
    }
  },
  appLogs: {
    logUserInApp: async () => true
  }
};

export { supabase };
export const isLocalMode = false;
