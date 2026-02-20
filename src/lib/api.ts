import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;
const functionBaseUrl =
  import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
  `${supabaseUrl}/functions/v1/make-server-d67cb24d`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = functionBaseUrl;

export const api = {
  get: async (endpoint: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
    };
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  post: async (endpoint: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  put: async (endpoint: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  delete: async (endpoint: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
    };
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }
};
