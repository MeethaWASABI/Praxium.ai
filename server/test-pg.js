import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://praxium_user:reena2626@postgres:5432/praxium'
});

async function run() {
    try {
        await client.connect();
        console.log("SUCCESSFULLY CONNECTED TO POSTGRES");
        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log("DB INFO:", res.rows[0]);
    } catch (e) {
        console.error("CONNECTION FAILED:", e.message);
    } finally {
        await client.end();
    }
}

run();
