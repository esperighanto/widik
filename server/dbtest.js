//Demo code I got from here: https://stackabuse.com/using-postgresql-with-nodejs-and-node-postgres/

const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: 'Letmein721!',
    port: 5432,
});

client.connect();


client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Postgress connection succeeded.');
    client.end();
});