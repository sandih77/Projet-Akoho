import sql from 'mssql';

const config = {
    user: 'sa',
    password: 'Sqlserver123!',
    server: 'localhost',
    database: 'Akoho',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export default class Database {
    static pool = null;

    static async connect() {
        try {
            if (!Database.pool) {
                Database.pool = await sql.connect(config);
                console.log('Connexion SQL Server réussie');
            }
            return Database.pool;
        } catch (err) {
            console.error('Erreur de connexion SQL Server:', err);
            throw err;
        }
    }

    static getSql() {
        return sql;
    }

    static async getPool() {
        if (!Database.pool) {
            await Database.connect();
        }
        return Database.pool;
    }
}