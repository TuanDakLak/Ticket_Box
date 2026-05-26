import { PrismaClient } from "@prisma/client";
import { getOrderPlan } from "./orders.seed";
import { chunkArray } from "./seed-utils";

const CHUNK_SIZE = 5000;

export async function seedTickets(prisma: PrismaClient) {
    const { tickets } = await getOrderPlan(prisma);
    if (tickets.length === 0) {
        return;
    }

    const checker = await prisma.user.findFirst({
        where: {
            user_roles: {
                some: {
                    role: { name: "Checker" },
                },
            },
        },
        select: { id: true },
    });

    const checkerId = checker?.id ?? null;

    const categories = await prisma.ticketCategory.findMany({
        select: { id: true, concert_id: true, name: true },
    });
    const categoryMap = new Map(
        categories.map((category) => [
            `${category.concert_id}:${category.name}`,
            category.id,
        ]),
    );

    const rows = tickets.map((ticket) => {
        const categoryId = categoryMap.get(
            `${ticket.concert_id}:${ticket.category_name}`,
        );
        if (!categoryId) {
            throw new Error(
                `Missing category ${ticket.category_name} for concert ${ticket.concert_id}`,
            );
        }

        return {
            id: ticket.id,
            order_id: ticket.order_id,
            category_id: categoryId,
            qr_code_hash: ticket.qr_code_hash,
            is_scanned: ticket.is_scanned,
            scanned_at: ticket.is_scanned ? ticket.scanned_at : null,
            scanned_by: ticket.is_scanned ? checkerId : null,
        };
    });

    for (const chunk of chunkArray(rows, CHUNK_SIZE)) {
        await prisma.ticket.createMany({ data: chunk });
    }
}
