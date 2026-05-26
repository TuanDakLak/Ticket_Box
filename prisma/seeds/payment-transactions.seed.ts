import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { FAKER_SEED } from "./seed-data";
import { chunkArray } from "./seed-utils";

const CHUNK_SIZE = 5000;
const PAYMENT_METHODS = ["VNPAY", "MOMO"] as const;

export async function seedPaymentTransactions(prisma: PrismaClient) {
    faker.seed(FAKER_SEED + 1);

    const paidOrders = await prisma.order.findMany({
        where: { status: "PAID" },
        select: { id: true, total_amount: true },
    });

    const rows = paidOrders.map((order) => {
        const method = faker.helpers.arrayElement(PAYMENT_METHODS);
        const ref = `${method}-${order.id.slice(0, 8)}`;

        return {
            id: faker.string.uuid(),
            order_id: order.id,
            payment_method: method,
            transaction_id_3rd_party: ref,
            amount: order.total_amount,
            status: "SUCCESS",
            idempotency_key: `seed-${order.id}`,
            raw_response: {
                provider: method,
                ref,
            },
        };
    });

    for (const chunk of chunkArray(rows, CHUNK_SIZE)) {
        await prisma.paymentTransaction.createMany({ data: chunk });
    }
}
