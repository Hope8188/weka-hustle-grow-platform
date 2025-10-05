import { db } from '@/db';
import { customers, user } from '@/db/schema';

async function main() {
    // First, get an existing user ID from the database
    const existingUsers = await db.select({ id: user.id }).from(user).limit(1);
    
    if (existingUsers.length === 0) {
        console.error('❌ No users found in database. Please seed users table first.');
        return;
    }
    
    const userId = existingUsers[0].id;
    
    const sampleCustomers = [
        {
            userId: userId,
            name: 'Peter Mwangi',
            email: 'peter.mwangi@gmail.com',
            phone: '+254712345678',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: userId,
            name: 'Grace Wanjiku',
            email: 'grace.wanjiku@yahoo.com',
            phone: '+254722123456',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: userId,
            name: 'John Kamau',
            email: 'john.kamau@gmail.com',
            phone: '+254733987654',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: userId,
            name: 'Faith Akinyi',
            email: 'faith.akinyi@gmail.com',
            phone: '+254701234567',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            userId: userId,
            name: 'David Omondi',
            email: 'david.omondi@yahoo.com',
            phone: '+254789456123',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
    ];

    await db.insert(customers).values(sampleCustomers);
    
    console.log('✅ Customers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});