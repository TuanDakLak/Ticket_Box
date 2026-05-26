import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { concerts, FAKER_SEED } from "./seed-data";
import { chunkArray } from "./seed-utils";

const GUESTS_PER_CONCERT = 10;
const CHUNK_SIZE = 5000;
const CATEGORY_NAMES = ["SVIP", "VIP 1", "VIP 2", "GA"];

export async function seedGuestLists(prisma: PrismaClient) {
    faker.seed(FAKER_SEED + 3);

    const rows = concerts.flatMap((concert, concertIndex) =>
        Array.from({ length: GUESTS_PER_CONCERT }, (_, index) => ({
            concert_id: concert.id,
            email: `guest${concertIndex + 1}-${index + 1}@ticketbox.local`,
            full_name: `${faker.person.firstName()} ${faker.person.lastName()}`,
            ticket_category: faker.helpers.arrayElement(CATEGORY_NAMES),
            is_scanned: faker.number.int({ min: 1, max: 100 }) <= 10,
        })),
    );

    for (const chunk of chunkArray(rows, CHUNK_SIZE)) {
        await prisma.guestList.createMany({ data: chunk, skipDuplicates: true });
    }
}
