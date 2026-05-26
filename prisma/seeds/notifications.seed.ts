import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { FAKER_SEED } from "./seed-data";
import { chunkArray } from "./seed-utils";

const notificationTemplates = [
    {
        id: "f1a2b3c4-d5e6-4f70-8a9b-0c1d2e3f4a55",
        code: "TICKET_CONFIRMATION",
        channel: "EMAIL",
        subject: "Your e-ticket is ready",
        content: "Your e-ticket is attached to this email.",
    },
    {
        id: "a1b2c3d4-e5f6-4a70-9b8c-1d2e3f4a5b66",
        code: "PAYMENT_SUCCESS",
        channel: "EMAIL",
        subject: "Payment confirmed",
        content: "We have received your payment.",
    },
];

export async function seedNotifications(prisma: PrismaClient) {
    faker.seed(FAKER_SEED + 4);

    await prisma.notificationTemplate.createMany({
        data: notificationTemplates,
        skipDuplicates: true,
    });

    const audienceUsers = await prisma.user.findMany({
        where: {
            user_roles: {
                some: {
                    role: { name: "Audience" },
                },
            },
        },
        select: { id: true, email: true },
        take: 50,
    });

    if (audienceUsers.length === 0) {
        return;
    }

    const rows = Array.from({ length: 20 }, () => {
        const user = faker.helpers.arrayElement(audienceUsers);
        const template = faker.helpers.arrayElement(notificationTemplates);
        const createdAt = faker.date.between({
            from: new Date("2026-05-01T00:00:00+07:00"),
            to: new Date("2026-05-20T23:59:59+07:00"),
        });
        const sentAt = new Date(createdAt.getTime() + 60 * 1000);

        return {
            id: faker.string.uuid(),
            user_id: user.id,
            template_id: template.id,
            target: user.email,
            status: "SENT",
            retry_count: 0,
            created_at: createdAt,
            sent_at: sentAt,
        };
    });

    for (const chunk of chunkArray(rows, 5000)) {
        await prisma.notificationLog.createMany({ data: chunk });
    }
}
