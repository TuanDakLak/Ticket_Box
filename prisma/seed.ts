import { PrismaClient } from "@prisma/client";
import { seedAuth } from "./seeds/auth.seed";
import { seedBackgroundJobs } from "./seeds/background-jobs.seed";
import { seedCatalog } from "./seeds/catalog.seed";
import { seedGuestLists } from "./seeds/guest-lists.seed";
import { seedNotifications } from "./seeds/notifications.seed";
import { seedOrders } from "./seeds/orders.seed";
import { seedPaymentTransactions } from "./seeds/payment-transactions.seed";
import { seedTicketCategories } from "./seeds/ticket-categories.seed";
import { seedTickets } from "./seeds/tickets.seed";

const prisma = new PrismaClient();

async function runSeed(name: string, task: () => Promise<void>) {
    const startedAt = Date.now();
    console.log(`[seed] starting ${name}`);
    await task();
    const elapsedMs = Date.now() - startedAt;
    console.log(`[seed] finished ${name} in ${elapsedMs}ms`);
}

async function clearDatabase() {
    await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.deleteMany();
        await tx.ticket.deleteMany();
        await tx.order.deleteMany();
        await tx.guestList.deleteMany();
        await tx.backgroundJob.deleteMany();
        await tx.notificationLog.deleteMany();
        await tx.notificationTemplate.deleteMany();
        await tx.userRole.deleteMany();
        await tx.rolePermission.deleteMany();
        await tx.permission.deleteMany();
        await tx.role.deleteMany();
        await tx.ticketCategory.deleteMany();
        await tx.concert.deleteMany();
        await tx.user.deleteMany();
    });
}

async function seedAll() {
    await runSeed("clear", () => clearDatabase());
    await runSeed("auth", () => seedAuth(prisma));
    await runSeed("catalog", () => seedCatalog(prisma));
    await runSeed("ticket_categories", () => seedTicketCategories(prisma));
    await runSeed("orders", () => seedOrders(prisma));
    await runSeed("payment_transactions", () => seedPaymentTransactions(prisma));
    await runSeed("tickets", () => seedTickets(prisma));
    await runSeed("notifications", () => seedNotifications(prisma));
    await runSeed("guest_lists", () => seedGuestLists(prisma));
    await runSeed("background_jobs", () => seedBackgroundJobs(prisma));
}

seedAll()
    .then(() => {
        console.log("Seed completed.");
    })
    .catch((error) => {
        console.error("Seed failed.");
        console.error(error);
        throw error;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
