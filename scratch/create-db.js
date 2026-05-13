const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '16102000',
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE "ecommerce-db"');
    console.log('Database "ecommerce-db" created successfully.');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database "ecommerce-db" already exists.');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();
