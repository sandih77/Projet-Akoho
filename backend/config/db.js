import sql from "mssql";

const config = {
    user: "sa",
    password: "Sqlserver123!",
    server: "localhost",
    database: "Akoho",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export default class Database {
    static async connect() {
        try {
            await sql.connect(config);
            console.log("Connexion SQL Server réussie");
        } catch (err) {
            console.error("Erreur de connexion:", err);
        }
    }

    static getSql() {
        return sql;
    }
}