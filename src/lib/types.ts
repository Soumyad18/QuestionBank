import type { Category, Difficulty, Round } from "@/lib/categories";

export type UserRole = "admin" | "user";

export interface Question {
  id: string;
  text: string;
  company: string;
  round: Round;
  date: string;
  interviewerName?: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
