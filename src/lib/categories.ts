export const CATEGORIES = [
  "Java",
  "Spring Boot",
  "Microservices",
  "AWS",
  "MongoDB",
  "System Design",
  "Coding",
  "General",
  "Kafka",
  "RabbitMQ",
  "Docker",
  "Kubernetes",
  "Security",
  "SQL",
  "DevOps",
  "Networking",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTY = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTY)[number];

export const ROUNDS = ["screening", "l1", "l2", "hr", "f2f"] as const;
export type Round = (typeof ROUNDS)[number];

export const ROUND_LABELS: Record<Round, string> = {
  screening: "Screening",
  l1: "L1",
  l2: "L2",
  hr: "HR",
  f2f: "F2F",
};
