import express from "express";
import cors from "cors";
import LotRoutes from "./routes/LotRoutes.js";
import RaceRoutes from "./routes/RaceRoutes.js";
import AtodyRoutes from "./routes/AtodyRoutes.js";
import AkohoMatyRoutes from "./routes/AkohoMatyRoutes.js";
import EclosionRoutes from "./routes/EclosionRoutes.js";
import BilanRoutes from "./routes/BilanRoutes.js";
import Database from "./config/db.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const lotRoutes = new LotRoutes();
app.use("/api/lots", lotRoutes.getRouter());

const raceRoutes = new RaceRoutes();
app.use("/api/races", raceRoutes.getRouter());

const atodyRoutes = new AtodyRoutes();
app.use("/api/atody", atodyRoutes.getRouter());

const akohoMatyRoutes = new AkohoMatyRoutes();
app.use("/api/akoho-maty", akohoMatyRoutes.getRouter());

const eclosionRoutes = new EclosionRoutes();
app.use("/api/eclosion", eclosionRoutes.getRouter());

const bilanRoutes = new BilanRoutes();
app.use("/api/bilan", bilanRoutes.getRouter());

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