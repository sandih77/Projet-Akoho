import express from "express";
import cors from "cors";
import LotRoutes from "./routes/LotRoutes.js";
import RaceRoutes from "./routes/RaceRoutes.js";
import Database from "./config/db.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const lotRoutes = new LotRoutes();
app.use("/api/lots", lotRoutes.getRouter());

const raceRoutes = new RaceRoutes();
app.use("/api/races", raceRoutes.getRouter());

// Connexion à la base de données au démarrage
Database.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Impossible de démarrer le serveur:", err);
    });