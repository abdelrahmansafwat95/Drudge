export type Role = 'ADMIN' | 'MANAGER' | 'TEAM_LEADER' | 'AGENT';

export interface Profile {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Site {
  id: string;
  client_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  client?: Pick<Client, 'id' | 'name'>;
}

export interface Zone {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  leader_id?: string;
  is_active: boolean;
  created_at: string;
  leader?: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
  profile?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'role'>;
}

export type VisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Visit {
  id: string;
  site_id: string;
  team_id: string;
  status: VisitStatus;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  signature?: string;
  signed_by?: string;
  created_at: string;
  site?: Site & { client?: Pick<Client, 'name'> };
  team?: Pick<Team, 'id' | 'name'>;
  checklist_items?: ChecklistItem[];
  findings?: Finding[];
  chemical_logs?: ChemicalLog[];
}

export interface ChecklistItem {
  id: string;
  visit_id: string;
  description: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Finding {
  id: string;
  visit_id: string;
  description: string;
  severity: FindingSeverity;
  location?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Chemical {
  id: string;
  name: string;
  active_ingredient?: string;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface ChemicalLog {
  id: string;
  visit_id: string;
  chemical_id: string;
  quantity: number;
  notes?: string;
  created_at: string;
  chemical?: Pick<Chemical, 'name' | 'unit'>;
}
