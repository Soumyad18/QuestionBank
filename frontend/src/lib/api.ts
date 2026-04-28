import { supabase } from "./supabase";
import type {
  ApiResponse, PageResponse,
  Question, Company, Tag, Session,
  QuestionFilters, AdminStats, CategoryItem, Candidate, UserProfile,
  UserDashboardStats, UserSessionDetails, EmailLog
} from "./types";

const BASE = "http://localhost:8080";

async function getHeaders(auth = false): Promise<HeadersInit> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }
  return headers;
}

async function get<T>(path: string, auth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: await getHeaders(auth) });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message ?? "Request failed");
  return json.data;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: await getHeaders(true),
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message ?? "Request failed");
  return json.data;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: await getHeaders(true),
  });
  const json: ApiResponse<void> = await res.json();
  if (!json.success) throw new Error(json.message ?? "Request failed");
}

async function post<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: await getHeaders(auth),
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message ?? "Request failed");
  return json.data;
}

// ── Questions ──────────────────────────────────────────────
export function searchQuestions(filters: QuestionFilters) {
  const params = new URLSearchParams();
  if (filters.search)        params.set("search",       filters.search);
  if (filters.interviewType) params.set("interviewType", filters.interviewType);
  if (filters.category)      params.set("category",      filters.category);
  if (filters.company)       params.set("company",       filters.company);
  if (filters.round)         params.set("round",         filters.round);
  if (filters.tag)           params.set("tag",           filters.tag);
  if (filters.importance)    params.set("importance",    filters.importance);
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 20));
  return get<PageResponse<Question>>(`/api/questions?${params}`);
}

export function getQuestion(id: string) {
  return get<Question>(`/api/questions/${id}`);
}

export function updateQuestion(id: string, body: { text: string; category: string; tags: string[] }) {
  return put<Question>(`/api/questions/${id}`, body);
}

export function deleteQuestion(id: string) {
  return del(`/api/questions/${id}`);
}

// ── Companies ──────────────────────────────────────────────
export function getCompanies() {
  return get<Company[]>("/api/companies");
}

export function getQuestionsByCompany(slug: string) {
  return get<Question[]>(`/api/companies/${slug}/questions`);
}

// ── Tags ───────────────────────────────────────────────────
export function getTags() {
  return get<Tag[]>("/api/tags");
}

// ── Sessions ───────────────────────────────────────────────
export function getSessions() {
  return get<Session[]>("/api/sessions");
}

// ── Digest ─────────────────────────────────────────────────
export function digestParse(rawText: string) {
  return post<DigestParseResponse>("/api/digest/parse", { rawText });
}

export function digestCommit(body: DigestCommitRequest) {
  return post<DigestCommitResponse>("/api/digest/commit", body);
}

// Digest types (mirrors backend DTOs)
export interface DigestParseResponse {
  sessions: ParsedSession[];
}

export interface ParsedSession {
  candidateName: string;
  companyName: string;
  round: string;
  date: string;
  interviewerName?: string;
  questions: ParsedQuestion[];
}

export interface ParsedQuestion {
  existingQuestionId: string | null;
  text: string;
  category: string;
  tags: string[];
}

export interface DigestCommitRequest {
  sessions: ParsedSession[];
}

export interface DigestCommitResponse {
  savedQuestions: number;
  linkedQuestions: number;
  newSessions: number;
}

// ── User Profile + Dashboard ─────────────────────────────────
export function getMe(): Promise<UserProfile> {
  return get<UserProfile>("/api/users/me", true);
}
export function updateMe(body: { name: string; phone: string }): Promise<UserProfile> {
  return put<UserProfile>("/api/users/me", body);
}
export function getUserDashboardStats(): Promise<UserDashboardStats> {
  return get<UserDashboardStats>("/api/user/dashboard/stats", true);
}
export function getMySessions(): Promise<UserSessionDetails[]> {
  return get<UserSessionDetails[]>("/api/users/me/sessions", true);
}

// ── Admin Stats ────────────────────────────────────────────
export function getAdminStats(): Promise<AdminStats> {
  return get<AdminStats>("/api/admin/dashboard/stats", true);
}

// ── Categories ────────────────────────────────────────────
export function getCategories(): Promise<CategoryItem[]> {
  return get<CategoryItem[]>("/api/categories");
}
export function createCategory(name: string, interviewType: string): Promise<CategoryItem> {
  return post<CategoryItem>("/api/categories", { name, interviewType });
}
export function updateCategory(id: string, name: string): Promise<CategoryItem> {
  return put<CategoryItem>(`/api/categories/${id}`, { name });
}
export function deleteCategory(id: string): Promise<void> {
  return del(`/api/categories/${id}`);
}

// ── Tags CRUD ──────────────────────────────────────────────
export function deleteTag(id: string): Promise<void> {
  return del(`/api/tags/${id}`);
}

// ── Sessions CRUD ──────────────────────────────────────────
export function deleteSession(id: string): Promise<void> {
  return del(`/api/sessions/${id}`);
}

// ── Companies CRUD ─────────────────────────────────────────
export function createCompany(name: string): Promise<Company> {
  return post<Company>("/api/companies", { name });
}
export function updateCompany(slug: string, name: string): Promise<Company> {
  return put<Company>(`/api/companies/${slug}`, { name });
}
export function deleteCompany(slug: string): Promise<void> {
  return del(`/api/companies/${slug}`);
}

// ── Admin Users ────────────────────────────────────────────
export function getAdminUsers(): Promise<UserProfile[]> {
  return get<UserProfile[]>("/api/admin/users", true);
}
export function toggleAdmin(id: string): Promise<UserProfile> {
  return put<UserProfile>(`/api/admin/users/${id}/toggle-admin`, {});
}
export function linkCandidate(sessionId: string, candidateId: string | null): Promise<void> {
  return put<void>(`/api/admin/users/sessions/${sessionId}/link-candidate`, { candidateId: candidateId ?? "" });
}

// ── Email ─────────────────────────────────────────────────
export function sendEmails(body: {
  recipients: { email: string; name: string; company: string; round: string; date: string }[];
  filters: Record<string, string>;
}): Promise<{ emailsSent: number; errors: string[] }> {
  return post<{ emailsSent: number; errors: string[] }>("/api/admin/email/send", body);
}

export function getEmailLogs(filters: {
  sentBy?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<EmailLog>> {
  const params = new URLSearchParams();
  if (filters.sentBy) params.set("sentBy", filters.sentBy);
  if (filters.from)   params.set("from",   filters.from);
  if (filters.to)     params.set("to",     filters.to);
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 20));
  return get<PageResponse<EmailLog>>(`/api/admin/email/logs?${params}`, true);
}

// ── Candidates ─────────────────────────────────────────────
export async function getCandidates(): Promise<Candidate[]> {
  return Promise.resolve([
    { id: "1", name: "Alice Smith", email: "alice@example.com" },
    { id: "2", name: "Bob Jones", email: "bob@example.com" },
    { id: "3", name: "Carol Davis", email: "carol@example.com" }
  ]);
}

export async function triggerEmails(candidateId: string, questionIds: string[]): Promise<void> {
  console.log(`Sending emails to candidate ${candidateId} for questions ${questionIds.join(", ")}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
}

