import type { Category, Round } from "@/lib/categories";

export type UserRole = "admin" | "user";

// Matches backend QuestionDTO
export interface SessionInfo {
  companyName: string;
  round: Round;
  interviewDate: string;
}

export interface Question {
  id: string;
  text: string;
  category: Category;
  occurrenceCount: number;
  tags: string[];
  askedByCompanies: string[];
  sessions: SessionInfo[];
  relevancyLabel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
  sessionCount?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  questionCount?: number;
}

export interface Session {
  id: string;
  candidateName: string;
  companyName: string;
  companySlug: string;
  round: Round;
  interviewDate: string;
  interviewerName?: string;
  questionCount?: number;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface QuestionFilters {
  search?: string;
  interviewType?: string;
  category?: string;
  company?: string;
  round?: string;
  tag?: string;
  importance?: string;
  page?: number;
  size?: number;
}

export interface AdminStats {
  totalQuestions: number;
  totalCompanies: number;
  totalSessions: number;
  totalCandidates: number;
  questionsByImportance: {
    CRITICAL: number;
    HIGH: number;
    MODERATE: number;
    LOW: number;
  };
  lastDigestDate: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  interviewType?: 'backend' | 'frontend' | 'shared';
  questionCount: number;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isAdmin: boolean;
  sessionCount: number;
  createdAt: string;
}

export interface UserDashboardStats {
  totalSessions: number;
  totalCompanies: number;
  lastInterviewDate: string | null;
}

export interface UserSessionDetails {
  id: string;
  companyName: string;
  companySlug: string;
  round: string;
  interviewDate: string;
  interviewerName?: string;
  questions: {
    id: string;
    text: string;
    category: string;
    relevancyLabel: string | null;
    tags: string[];
  }[];
}

export interface EmailLog {
  id: string;
  sentBy: string | null;
  subject: string;
  recipientCount: number;
  recipientEmails: string[];
  filters: Record<string, string> | null;
  sentAt: string;
}

