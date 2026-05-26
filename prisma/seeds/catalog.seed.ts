import { PrismaClient } from "@prisma/client";
import { concerts } from "./seed-data";

export async function seedCatalog(prisma: PrismaClient) {
    await prisma.concert.createMany({
        data: concerts,
        skipDuplicates: true,
    });
}
