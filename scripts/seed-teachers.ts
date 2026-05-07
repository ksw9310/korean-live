import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const teachers = [
  {
    clerkId: "seed_teacher_001",
    email: "jimin.park@koreanlive.dev",
    name: "Park Jimin",
    avatarUrl: "https://i.pravatar.cc/300?img=47",
    bio: "Seoul National University Korean Language & Literature graduate. I specialize in helping beginners build a solid foundation through fun, conversational lessons. Native speaker with 5 years of online teaching experience.",
    levelsTaught: ["BEGINNER"],
    pricePerCredit: 10,
    creditCost: 1,
    languages: ["English", "Korean"],
    rating: 4.9,
    totalReviews: 84,
  },
  {
    clerkId: "seed_teacher_002",
    email: "soyeon.kim@koreanlive.dev",
    name: "Kim Soyeon",
    avatarUrl: "https://i.pravatar.cc/300?img=44",
    bio: "TOPIK examiner and certified Korean teacher with 8 years of experience. I focus on grammar precision and help students pass TOPIK II. My lessons are structured, thorough, and always tailored to your goals.",
    levelsTaught: ["ADVANCED"],
    pricePerCredit: 10,
    creditCost: 2,
    languages: ["English", "Japanese", "Korean"],
    rating: 4.8,
    totalReviews: 112,
  },
  {
    clerkId: "seed_teacher_003",
    email: "taehyun.lee@koreanlive.dev",
    name: "Lee Taehyun",
    avatarUrl: "https://i.pravatar.cc/300?img=68",
    bio: "Former K-drama actor turned Korean tutor! I make lessons entertaining through pop culture, K-dramas, and music. Perfect for students who want to learn natural, everyday Korean as it's actually spoken.",
    levelsTaught: ["INTERMEDIATE"],
    pricePerCredit: 10,
    creditCost: 1.5,
    languages: ["English", "Korean"],
    rating: 4.7,
    totalReviews: 67,
  },
  {
    clerkId: "seed_teacher_004",
    email: "hyejin.choi@koreanlive.dev",
    name: "Choi Hyejin",
    avatarUrl: "https://i.pravatar.cc/300?img=49",
    bio: "Business Korean specialist based in Busan. I help professionals communicate confidently in Korean workplace settings — emails, meetings, presentations. MA in Applied Linguistics from Yonsei University.",
    levelsTaught: ["ADVANCED"],
    pricePerCredit: 10,
    creditCost: 2,
    languages: ["English", "Chinese", "Korean"],
    rating: 5.0,
    totalReviews: 38,
  },
  {
    clerkId: "seed_teacher_005",
    email: "minho.yoon@koreanlive.dev",
    name: "Yoon Minho",
    avatarUrl: "https://i.pravatar.cc/300?img=57",
    bio: "Patient and encouraging teacher for absolute beginners. I break down Hangul from scratch and help you gain confidence quickly. Over 200 students taught online. Let's start your Korean journey together!",
    levelsTaught: ["BEGINNER"],
    pricePerCredit: 10,
    creditCost: 1,
    languages: ["English", "Spanish", "Korean"],
    rating: 4.6,
    totalReviews: 203,
  },
  {
    clerkId: "seed_teacher_006",
    email: "eunji.han@koreanlive.dev",
    name: "Han Eunji",
    avatarUrl: "https://i.pravatar.cc/300?img=45",
    bio: "Advanced Korean and Korean literature specialist. I help advanced learners master nuance, idioms, and formal/informal registers. Also offers preparation for university entrance exams and TOPIK II level 5–6.",
    levelsTaught: ["ADVANCED"],
    pricePerCredit: 10,
    creditCost: 2,
    languages: ["English", "French", "Korean"],
    rating: 4.9,
    totalReviews: 55,
  },
];

const days = [1, 2, 3, 4, 5]; // Mon–Fri

async function main() {
  console.log("Seeding teachers...");

  for (const t of teachers) {
    const user = await db.user.upsert({
      where: { clerkId: t.clerkId },
      update: { avatarUrl: t.avatarUrl, name: t.name },
      create: {
        clerkId: t.clerkId,
        email: t.email,
        name: t.name,
        avatarUrl: t.avatarUrl,
        role: "TEACHER",
      },
    });

    const existing = await db.teacherProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await db.teacherProfile.update({
        where: { userId: user.id },
        data: {
          bio: t.bio,
          levelsTaught: t.levelsTaught as any,
          pricePerCredit: t.pricePerCredit,
          creditCost: t.creditCost,
          languages: t.languages,
          rating: t.rating,
          totalReviews: t.totalReviews,
          isVerified: true,
        },
      });
    } else {
      await db.teacherProfile.create({
        data: {
          userId: user.id,
          bio: t.bio,
          levelsTaught: t.levelsTaught as any,
          pricePerCredit: t.pricePerCredit,
          creditCost: t.creditCost,
          languages: t.languages,
          rating: t.rating,
          totalReviews: t.totalReviews,
          isVerified: true,
          availabilities: {
            create: days.map((day) => ({
              dayOfWeek: day,
              startTime: "09:00",
              endTime: "21:00",
            })),
          },
        },
      });
    }

    console.log(`  ✓ ${t.name}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
