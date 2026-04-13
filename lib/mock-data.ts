import type { Question } from "@/lib/types";

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "How would you design a URL shortener for high traffic?",
    company: "Acme Corp",
    round: "l2",
    date: "2026-04-10",
    category: "System Design",
    difficulty: "hard",
    tags: ["system design", "scalability", "database"],
    createdAt: "2026-04-10T09:10:00.000Z",
    updatedAt: "2026-04-10T09:10:00.000Z",
    createdBy: "admin_1",
    updatedBy: "admin_1",
  },
  {
    id: "q2",
    text: "Explain the differences between HashMap and ConcurrentHashMap.",
    company: "Globex",
    round: "l1",
    date: "2026-04-09",
    category: "Java",
    difficulty: "medium",
    tags: ["java", "collections", "multithreading"],
    createdAt: "2026-04-09T07:00:00.000Z",
    updatedAt: "2026-04-09T07:00:00.000Z",
    createdBy: "admin_1",
    updatedBy: "admin_1",
  },
];
