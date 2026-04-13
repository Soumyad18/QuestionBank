export const CATEGORIES = [
  "Java",
  "Spring Boot",
  "Microservices",
  "AWS",
  "MongoDB",
  "System Design",
  "Coding",
  "General",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTY = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTY)[number];
