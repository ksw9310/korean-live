export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const LEVEL_CREDIT_COST: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 1.5,
  ADVANCED: 2,
};

export const LEVEL_INFO: Record<
  string,
  { label: string; topik: string; creditCost: number; price: number; bullets: string[] }
> = {
  BEGINNER: {
    label: "Beginner",
    topik: "Pre-TOPIK ~ TOPIK I (Level 1–2)",
    creditCost: 1,
    price: 10,
    bullets: [
      "Complete beginners welcome",
      "Learn Hangul from scratch",
      "Basic greetings & daily expressions",
      "Simple conversations about yourself",
    ],
  },
  INTERMEDIATE: {
    label: "Intermediate",
    topik: "TOPIK II (Level 3–4)",
    creditCost: 1.5,
    price: 15,
    bullets: [
      "Can hold basic conversations",
      "Grammar patterns & vocabulary building",
      "Reading & writing simple texts",
      "Everyday situations (shopping, travel, etc.)",
    ],
  },
  ADVANCED: {
    label: "Advanced",
    topik: "TOPIK II (Level 5–6)",
    creditCost: 2,
    price: 20,
    bullets: [
      "Fluent in daily conversations",
      "Business Korean & formal writing",
      "News, literature, nuanced expression",
      "TOPIK II Level 5–6 preparation",
    ],
  },
};

export interface CreditPack {
  id: string;
  credits: number;
  price: number;
  label: string;
  description: string;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "5credits",
    credits: 5,
    price: 49,
    label: "Starter",
    description: "Try your first lesson",
  },
  {
    id: "10credits",
    credits: 10,
    price: 89,
    label: "Popular",
    description: "10% off per session",
    popular: true,
  },
  {
    id: "20credits",
    credits: 20,
    price: 159,
    label: "Best Value",
    description: "20% off per session",
  },
];

export const PLATFORM_FEE_PERCENT =
  Number(process.env.PLATFORM_FEE_PERCENT) || 20;

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
