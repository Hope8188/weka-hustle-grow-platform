import { db } from '@/db';
import { services, user } from '@/db/schema';

async function main() {
    // First, get an existing user ID from the database
    const existingUsers = await db.select({ id: user.id }).from(user).limit(1);
    
    if (existingUsers.length === 0) {
        console.error('❌ No users found in database. Please seed users first.');
        return;
    }
    
    const testUserId = existingUsers[0].id;
    
    const sampleServices = [
        {
            userId: testUserId,
            serviceName: 'Laundry Service',
            description: 'Professional washing, ironing, and folding of clothes. Same-day service available for urgent orders.',
            price: 800,
            status: 'active',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: testUserId,
            serviceName: 'House Cleaning',
            description: 'Complete house cleaning including floors, windows, and bathroom deep cleaning.',
            price: 2500,
            status: 'active',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            userId: testUserId,
            serviceName: 'Electrical Repairs',
            description: 'Licensed electrician services for wiring, socket installation, and electrical fault repairs.',
            price: 1500,
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: testUserId,
            serviceName: 'Plumbing Service',
            description: 'Expert plumbing repairs including pipe fixing, toilet repairs, and water tank installation.',
            price: 3000,
            status: 'inactive',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: testUserId,
            serviceName: 'Hair Braiding',
            description: 'Professional hair braiding services including box braids, cornrows, and twists.',
            price: 1200,
            status: 'active',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: testUserId,
            serviceName: 'Phone Repair',
            description: 'Fast phone screen replacement, battery replacement, and software troubleshooting for all phone models.',
            price: 600,
            status: 'inactive',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
    ];

    await db.insert(services).values(sampleServices);
    
    console.log('✅ Services seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});