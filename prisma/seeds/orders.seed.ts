import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { concerts, FAKER_SEED, ticketCategoryPricing } from "./seed-data";
import { chunkArray } from "./seed-utils";

const ORDER_COUNT = 15000;
const SAMPLE_USER_COUNT = 5000;
const MAX_TICKETS_PER_ORDER = 4;
const CHUNK_SIZE = 5000;
const ORDER_DATE_START = new Date("2026-03-01T00:00:00+07:00");
const ORDER_DATE_END = new Date("2026-05-20T23:59:59+07:00");

type OrderSeedRow = {
    id: string;
    user_id: string;
    concert_id: string;
    total_amount: string;
    status: string;
    created_at: Date;
    expires_at: Date;
};

type TicketSeedPlan = {
    id: string;
    order_id: string;
    concert_id: string;
    category_name: string;
    qr_code_hash: string;
    is_scanned: boolean;
    scanned_at: Date | null;
};

type OrderPlan = {
    orders: OrderSeedRow[];
    tickets: TicketSeedPlan[];
};

let cachedPlan: OrderPlan | null = null;

function pickOrderStatus() {
    const roll = faker.number.int({ min: 1, max: 100 });
    if (roll <= 70) {
        return "PAID";
    }
    if (roll <= 85) {
        return "PENDING";
    }
    return "CANCELLED";
}

async function buildOrderPlan(prisma: PrismaClient): Promise<OrderPlan> {
    faker.seed(FAKER_SEED);

    const audienceUsers = await prisma.user.findMany({
        where: {
            user_roles: {
                some: {
                    role: { name: "Audience" },
                },
            },
        },
        select: { id: true },
    });

    if (audienceUsers.length === 0) {
        throw new Error("No audience users found for order seeding.");
    }

    const userIds = audienceUsers.map((user) => user.id);
    const sampleSize = Math.min(SAMPLE_USER_COUNT, userIds.length);
    const sampledUserIds = faker.helpers.shuffle(userIds).slice(0, sampleSize);

    const pricingByName = new Map(
        ticketCategoryPricing.map((category) => [category.name, category.price]),
    );
    const concertIds = concerts.map((concert) => concert.id);

    const orders: OrderSeedRow[] = [];
    const tickets: TicketSeedPlan[] = [];

    for (let index = 0; index < ORDER_COUNT; index += 1) {
        const orderId = faker.string.uuid();
        const userId = faker.helpers.arrayElement(sampledUserIds);
        const concertId = faker.helpers.arrayElement(concertIds);
        const status = pickOrderStatus();
        const createdAt = faker.date.between({
            from: ORDER_DATE_START,
            to: ORDER_DATE_END,
        });
        const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

        const ticketCount = faker.number.int({ min: 1, max: MAX_TICKETS_PER_ORDER });
        let totalAmount = 0;

        for (let ticketIndex = 0; ticketIndex < ticketCount; ticketIndex += 1) {
            const category = faker.helpers.arrayElement(ticketCategoryPricing);
            const price = pricingByName.get(category.name);
            if (price === undefined) {
                throw new Error(`Missing price for category ${category.name}`);
            }

            totalAmount += price;

            if (status === "PAID") {
                const isScanned = faker.number.int({ min: 1, max: 100 }) <= 10;
                const scannedAt = isScanned
                    ? faker.date.between({
                        from: createdAt,
                        to: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
                    })
                    : null;

                tickets.push({
                    id: faker.string.uuid(),
                    order_id: orderId,
                    concert_id: concertId,
                    category_name: category.name,
                    qr_code_hash: `seed-${orderId}-${ticketIndex + 1}`,
                    is_scanned: isScanned,
                    scanned_at: scannedAt,
                });
            }
        }

        orders.push({
            id: orderId,
            user_id: userId,
            concert_id: concertId,
            total_amount: totalAmount.toString(),
            status,
            created_at: createdAt,
            expires_at: expiresAt,
        });
    }

    return { orders, tickets };
}

export async function getOrderPlan(prisma: PrismaClient): Promise<OrderPlan> {
    if (!cachedPlan) {
        cachedPlan = await buildOrderPlan(prisma);
    }

    return cachedPlan;
}

export async function seedOrders(prisma: PrismaClient) {
    const { orders } = await getOrderPlan(prisma);

    for (const chunk of chunkArray(orders, CHUNK_SIZE)) {
        await prisma.order.createMany({ data: chunk });
    }
}
