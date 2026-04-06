const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed:images...');
    
    // Clear existing item_images if any
    await prisma.item_images.deleteMany();
    console.log('Cleared existing item_images.');

    // Fetch all shop items
    const items = await prisma.shop_items.findMany();
    console.log(`Found ${items.length} items. Generating images...`);

    let count = 0;
    for (const item of items) {
        // We will generate 3 random mock images per item via picsum.
        // We use the item_id as part of the seed so they stay consistent across refreshes.
        const images = [
            { item_id: item.item_id, image_url: `https://picsum.photos/seed/item_${item.item_id}_1/800/800`, sort_order: 1 },
            { item_id: item.item_id, image_url: `https://picsum.photos/seed/item_${item.item_id}_2/800/800`, sort_order: 2 },
            { item_id: item.item_id, image_url: `https://picsum.photos/seed/item_${item.item_id}_3/800/800`, sort_order: 3 }
        ];

        await prisma.item_images.createMany({
            data: images
        });

        count += 3;
    }

    console.log(`Successfully generated ${count} images for ${items.length} items.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
