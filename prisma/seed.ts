import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "TicketBox@123";
const BCRYPT_SALT = "$2b$10$EixZaYVK1fsbw1ZfbX3OXe";

const roles = [
    { name: "ADMIN", description: "System administrator" },
    { name: "ORGANIZER", description: "Concert organizer" },
    { name: "CHECKER", description: "Gate staff" },
    { name: "AUDIENCE", description: "Regular customer" },
];

const permissions = [
    { code: "CREATE_CONCERT", description: "Create concerts" },
    { code: "UPDATE_CONCERT", description: "Update concerts" },
    { code: "DELETE_CONCERT", description: "Delete concerts" },
    { code: "VIEW_REVENUE", description: "View revenue reports" },
    { code: "SCAN_TICKET", description: "Scan tickets at gate" },
];

const rolePermissions: Record<string, string[]> = {
    ADMIN: ["CREATE_CONCERT", "UPDATE_CONCERT", "DELETE_CONCERT", "VIEW_REVENUE", "SCAN_TICKET"],
    ORGANIZER: ["CREATE_CONCERT", "UPDATE_CONCERT", "VIEW_REVENUE"],
    CHECKER: ["SCAN_TICKET"],
    AUDIENCE: [],
};

const users = [
    {
        email: "admin@ticketbox.local",
        full_name: "System Admin",
        status: "ACTIVE",
        roles: ["ADMIN"],
    },
    {
        email: "organizer@ticketbox.local",
        full_name: "Concert Organizer",
        status: "ACTIVE",
        roles: ["ORGANIZER"],
    },
    {
        email: "checker@ticketbox.local",
        full_name: "Gate Checker",
        status: "ACTIVE",
        roles: ["CHECKER"],
    },
];

const concerts = [
    {
        id: "0edb0b61-8c91-4d2c-9b7c-9b6e2e3e7cf1",
        name: "Anh Trai Say Hi",
        description: "A summer live show with top performers and a fan meetup.",
        location: "District 1 Stadium, Ho Chi Minh City",
        ai_bio:
            "A crowd-favorite line-up known for upbeat pop anthems and sharp choreography.",
        start_time: new Date("2026-06-20T19:30:00+07:00"),
        svg_map_url: "https://cdn.ticketbox.local/maps/anh-trai-say-hi.svg",
        status: "PUBLISHED",
    },
    {
        id: "41e6a7a3-2fdf-4f7b-8e5a-2b38c2af6b70",
        name: "Anh Trai Vuot Ngan Chong Gai",
        description: "A stadium-scale showcase featuring multi-artist collaborations.",
        location: "Hoa Xuan Stadium, Da Nang",
        ai_bio:
            "An energetic collaboration stage that blends modern pop with rock accents.",
        start_time: new Date("2026-07-05T20:00:00+07:00"),
        svg_map_url: "https://cdn.ticketbox.local/maps/anh-trai-vuot-ngan-chong-gai.svg",
        status: "PUBLISHED",
    },
    {
        id: "b51f1c19-27a2-49af-8f25-9c1f6fa82d3b",
        name: "Em Xinh Say Hi",
        description: "A vibrant showcase spotlighting fresh voices and dance crews.",
        location: "My Dinh Arena, Hanoi",
        ai_bio:
            "A feel-good concert with bright visuals, upbeat tracks, and audience sing-alongs.",
        start_time: new Date("2026-07-18T19:00:00+07:00"),
        svg_map_url: "https://cdn.ticketbox.local/maps/em-xinh-say-hi.svg",
        status: "PUBLISHED",
    },
    {
        id: "a1ff5dd8-4f83-4c64-a4c4-17b8bf90dc3d",
        name: "Chi Dep Dap Gio Re Song",
        description: "An evening show with cinematic staging and live-band arrangements.",
        location: "Da Lat Valley Theater, Lam Dong",
        ai_bio:
            "A theatrical performance blending ballads with live-band orchestration.",
        start_time: new Date("2026-08-02T19:30:00+07:00"),
        svg_map_url: "https://cdn.ticketbox.local/maps/chi-dep-dap-gio-re-song.svg",
        status: "PUBLISHED",
    },
];

const ticketCategoryTemplates = [
    { name: "SVIP", price: "3200000", total_quantity: 300, max_per_user: 2 },
    { name: "VIP", price: "1800000", total_quantity: 900, max_per_user: 4 },
    { name: "GA", price: "750000", total_quantity: 3000, max_per_user: 6 },
];

async function upsertTicketCategory(data: {
    concert_id: string;
    name: string;
    price: Prisma.Decimal | string;
    total_quantity: number;
    max_per_user: number;
}) {
    const existing = await prisma.ticketCategory.findFirst({
        where: {
            concert_id: data.concert_id,
            name: data.name,
        },
        select: { id: true },
    });

    if (existing) {
        return prisma.ticketCategory.update({
            where: { id: existing.id },
            data: {
                price: data.price,
                total_quantity: data.total_quantity,
                max_per_user: data.max_per_user,
            },
        });
    }

    return prisma.ticketCategory.create({ data });
}

async function seed() {
    const roleRecords = await Promise.all(
        roles.map((role) =>
            prisma.role.upsert({
                where: { name: role.name },
                update: { description: role.description },
                create: role,
            }),
        ),
    );

    const roleByName = new Map(roleRecords.map((role) => [role.name, role.id]));

    const permissionRecords = await Promise.all(
        permissions.map((permission) =>
            prisma.permission.upsert({
                where: { code: permission.code },
                update: { description: permission.description },
                create: permission,
            }),
        ),
    );

    const permissionByCode = new Map(
        permissionRecords.map((permission) => [permission.code, permission.id]),
    );

    for (const [roleName, permissionCodes] of Object.entries(rolePermissions)) {
        const roleId = roleByName.get(roleName);
        if (!roleId) {
            continue;
        }

        for (const code of permissionCodes) {
            const permissionId = permissionByCode.get(code);
            if (!permissionId) {
                continue;
            }

            await prisma.rolePermission.upsert({
                where: {
                    role_id_permission_id: {
                        role_id: roleId,
                        permission_id: permissionId,
                    },
                },
                update: {},
                create: {
                    role_id: roleId,
                    permission_id: permissionId,
                },
            });
        }
    }

    const password_hash = bcrypt.hashSync(DEFAULT_PASSWORD, BCRYPT_SALT);

    const userRecords = await Promise.all(
        users.map((user) =>
            prisma.user.upsert({
                where: { email: user.email },
                update: {
                    full_name: user.full_name,
                    status: user.status,
                    password_hash,
                },
                create: {
                    email: user.email,
                    full_name: user.full_name,
                    status: user.status,
                    password_hash,
                },
            }),
        ),
    );

    const userByEmail = new Map(
        userRecords.map((user) => [user.email, user.id]),
    );

    for (const user of users) {
        const userId = userByEmail.get(user.email);
        if (!userId) {
            continue;
        }

        for (const roleName of user.roles) {
            const roleId = roleByName.get(roleName);
            if (!roleId) {
                continue;
            }

            await prisma.userRole.upsert({
                where: {
                    user_id_role_id: {
                        user_id: userId,
                        role_id: roleId,
                    },
                },
                update: {},
                create: {
                    user_id: userId,
                    role_id: roleId,
                },
            });
        }
    }

    for (const concert of concerts) {
        await prisma.concert.upsert({
            where: { id: concert.id },
            update: {
                name: concert.name,
                description: concert.description,
                location: concert.location,
                ai_bio: concert.ai_bio,
                start_time: concert.start_time,
                svg_map_url: concert.svg_map_url,
                status: concert.status,
            },
            create: concert,
        });

        for (const category of ticketCategoryTemplates) {
            await upsertTicketCategory({
                concert_id: concert.id,
                name: category.name,
                price: category.price,
                total_quantity: category.total_quantity,
                max_per_user: category.max_per_user,
            });
        }
    }
}

seed()
    .then(() => {
        console.log("Seed completed.");
    })
    .catch((error) => {
        console.error("Seed failed.");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
