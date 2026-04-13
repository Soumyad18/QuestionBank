import type { Category, Difficulty } from "@/lib/categories";

export type UserRole = "admin" | "user";

export interface Question {
  id: string;
  text: string;
  company: string;
  round: "screening" | "l1" | "l2" | "hr";
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
