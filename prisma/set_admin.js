const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.users.findMany({ take: 10 });
    console.log(JSON.stringify(users, null, 2));
    
    // Set user_id 1 to ADMIN (adjust if needed)
    if (users.length > 0) {
        const firstUser = users[0];
        await prisma.users.update({
            where: { user_id: firstUser.user_id },
            data: { user_role: 'ADMIN' },
        });
        console.log(`\nSet user ${firstUser.user_name} (ID: ${firstUser.user_id}) to ADMIN`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
