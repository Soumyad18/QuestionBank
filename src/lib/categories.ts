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

export const ROUNDS = [
  "screening", "l1", "l2", "l3", "l4", "l5", "l6",
  "l7", "l8", "l9", "l10", "l11", "l12", "hr", "f2f",
] as const;
export type Round = (typeof ROUNDS)[number];

export const ROUND_LABELS: Record<Round, string> = {
  screening: "Screening",
  l1: "L1", l2: "L2", l3: "L3", l4: "L4",
  l5: "L5", l6: "L6", l7: "L7", l8: "L8",
  l9: "L9", l10: "L10", l11: "L11", l12: "L12",
  hr: "HR",
  f2f: "F2F",
};

// ── Color System ──
// Each round gets a unique hue-shifted color from the cyan spectrum
export const ROUND_COLORS: Record<Round, string> = {
  screening: "#888888",
  l1:  "#00F0FF", // cyan
  l2:  "#00D4AA", // teal
  l3:  "#00C878", // emerald
  l4:  "#4ADE80", // green
  l5:  "#A3E635", // lime
  l6:  "#FACC15", // yellow
  l7:  "#FB923C", // orange
  l8:  "#F87171", // red
  l9:  "#E879F9", // fuchsia
  l10: "#C084FC", // purple
  l11: "#818CF8", // indigo
  l12: "#60A5FA", // blue
  hr:  "#94A3B8", // slate
  f2f: "#F472B6", // pink
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   "#4ADE80", // green
  medium: "#FACC15", // yellow
  hard:   "#F87171", // red
};
