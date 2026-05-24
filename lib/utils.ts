import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import type { VisitStatus, FindingSeverity, Role } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export const STATUS_COLORS: Record<VisitStatus, string> = {
  SCHEDULED:   'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED:   'bg-green-100 text-green-700',
  CANCELLED:   'bg-red-100 text-red-700',
};

export const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  LOW:      'bg-gray-100 text-gray-700',
  MEDIUM:   'bg-yellow-100 text-yellow-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN:       'Admin',
  MANAGER:     'Manager',
  TEAM_LEADER: 'Team Leader',
  AGENT:       'Agent',
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN:       'bg-purple-100 text-purple-700',
  MANAGER:     'bg-blue-100 text-blue-700',
  TEAM_LEADER: 'bg-teal-100 text-teal-700',
  AGENT:       'bg-gray-100 text-gray-700',
};
