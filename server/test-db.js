const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://praxium_user:reena2626@postgres:5432/praxium?schema=public'
});

async function test() {
    try {
        await client.connect();
        console.log("SUCCESS");
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
    } catch (err) {
        console.error("ERROR", err);
    } finally {
        await client.end();
    }
}

test();
