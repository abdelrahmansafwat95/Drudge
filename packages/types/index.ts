export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'TEAM_LEADER' | 'AGENT' | 'CLIENT_USER';
export type VisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  organizationId: string;
  branchId?: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  leaderId?: string;
  isActive: boolean;
  members?: TeamMember[];
  leader?: User;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  sites?: Site[];
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  zones?: Zone[];
  client?: Client;
}

export interface Zone {
  id: string;
  siteId: string;
  name: string;
  description?: string;
}

export interface Visit {
  id: string;
  siteId: string;
  teamId: string;
  status: VisitStatus;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  site?: Site;
  team?: Team;
  checklistItems?: ChecklistItem[];
  findings?: Finding[];
  chemicalLogs?: ChemicalLog[];
}

export interface ChecklistItem {
  id: string;
  visitId: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Finding {
  id: string;
  visitId: string;
  description: string;
  severity: FindingSeverity;
  location?: string;
  isResolved: boolean;
}

export interface Chemical {
  id: string;
  organizationId: string;
  name: string;
  activeIngredient?: string;
  unit: string;
  isActive: boolean;
}

export interface ChemicalLog {
  id: string;
  visitId: string;
  chemicalId: string;
  quantity: number;
  notes?: string;
  chemical?: Chemical;
}

export interface Report {
  id: string;
  organizationId: string;
  visitId?: string;
  title: string;
  type: string;
  language: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardKPIs {
  totalClients: number;
  totalSites: number;
  totalVisits: number;
  completedVisits: number;
  scheduledVisits: number;
  completionRate: number;
  activeTeams: number;
  activeAgents: number;
}
