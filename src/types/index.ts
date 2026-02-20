export interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  created_at: string;
}

export interface Lead {
  id: string;
  data: Record<string, any>; // Dynamic data based on FieldConfig
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Converted';
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
