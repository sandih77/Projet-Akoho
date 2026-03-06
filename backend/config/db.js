const sql = require('mssql');

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

async function connectDB() {
    try {
        await sql.connect(config);
        console.log("Connexion SQL Server réussie");
    } catch (err) {
        console.error("Erreur de connexion:", err);
    }
}

module.exports = { sql, connectDB };