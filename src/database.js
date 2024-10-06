const mysql = require('mysql2/promise');

let connection;

async function useConnection() {
    try {
        if (!connection) {
            connection = await mysql.createConnection({
                host: 'mysql',
                user: 'user',
                password: 'pw',
                database: 'todo_client',
            });
            console.log('Database connected');
        }
        return connection;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

module.exports = useConnection;