import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const profiles = await db.teacherProfile.findMany();
  for (const p of profiles) {
    const mapped = (p.levelsTaught as string[]).map((l) => {
      if (["BEGINNER", "ELEMENTARY_1", "ELEMENTARY_2"].includes(l)) return "BEGINNER";
      if (["INTERMEDIATE_1", "INTERMEDIATE_2"].includes(l)) return "INTERMEDIATE";
      return "ADVANCED";
    });
    const unique = [...new Set(mapped)];
    await db.$executeRaw`UPDATE "TeacherProfile" SET "levelsTaught" = ${unique}::"KoreanLevel"[] WHERE id = ${p.id}`;
  }
  console.log("Fixed", profiles.length, "teacher profiles");

  // Fix student profiles - ELEMENTARY_1/2 → BEGINNER, etc.
  await db.$executeRaw`
    UPDATE "StudentProfile"
    SET "currentLevel" = 'BEGINNER'::"KoreanLevel"
    WHERE "currentLevel" IN ('ELEMENTARY_1', 'ELEMENTARY_2')
  `;
  console.log("Fixed student profiles");
  await db.$disconnect();
}

main().catch(console.error);
