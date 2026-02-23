const { Client } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function restorePasswords() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();
    try {
        const saltRounds = 10;

        const accounts = [
            { email: 'admin@medthread.com', password: 'Admin@123456' },
            { email: 'doctor@test.com', password: 'Doctor@123456' },
            { email: 'patient@test.com', password: 'Patient@123456' },
            { email: 'meghamaryvinu@licet.ac.in', password: 'Doctor@123456' }
        ];

        for (const account of accounts) {
            const hash = await bcrypt.hash(account.password, saltRounds);
            const res = await client.query(
                'UPDATE "User" SET "passwordHash" = $1 WHERE email = $2 RETURNING id',
                [hash, account.email]
            );

            if (res.rowCount > 0) {
                console.log(`✅ Restored password for ${account.email}`);
            } else {
                console.log(`⚠️ User ${account.email} not found in database.`);
            }
        }
    } catch (err) {
        console.error('❌ Error restoring passwords:', err);
    } finally {
        await client.end();
    }
}

restorePasswords();
