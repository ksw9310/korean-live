export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  ELEMENTARY_1: "Elementary 1",
  ELEMENTARY_2: "Elementary 2",
  INTERMEDIATE_1: "Intermediate 1",
  INTERMEDIATE_2: "Intermediate 2",
  ADVANCED_1: "Advanced 1",
  ADVANCED_2: "Advanced 2",
};

export const LEVEL_TOPIK: Record<string, string> = {
  BEGINNER: "Pre-TOPIK",
  ELEMENTARY_1: "TOPIK I (Level 1)",
  ELEMENTARY_2: "TOPIK I (Level 2)",
  INTERMEDIATE_1: "TOPIK II (Level 3)",
  INTERMEDIATE_2: "TOPIK II (Level 4)",
  ADVANCED_1: "TOPIK II (Level 5)",
  ADVANCED_2: "TOPIK II (Level 6)",
};

export interface CreditPack {
  id: string;
  credits: number;
  price: number;
  label: string;
  description: string;
  popular?: boolean;
  priceEnvKey: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "5credits",
    credits: 5,
    price: 49,
    label: "Starter",
    description: "Try your first lesson",
    priceEnvKey: "STRIPE_PRICE_5_CREDITS",
  },
  {
    id: "10credits",
    credits: 10,
    price: 89,
    label: "Popular",
    description: "10% off per session",
    popular: true,
    priceEnvKey: "STRIPE_PRICE_10_CREDITS",
  },
  {
    id: "20credits",
    credits: 20,
    price: 159,
    label: "Best Value",
    description: "20% off per session",
    priceEnvKey: "STRIPE_PRICE_20_CREDITS",
  },
];

export const PLATFORM_FEE_PERCENT =
  Number(process.env.PLATFORM_FEE_PERCENT) || 20;

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
