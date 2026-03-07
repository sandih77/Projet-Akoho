import express from "express";
import cors from "cors";
import LotRoutes from "./routes/LotRoutes.js";
import RaceRoutes from "./routes/RaceRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const lotRoutes = new LotRoutes();
app.use("/api/lots", lotRoutes.getRouter());

const raceRoutes = new RaceRoutes();
app.use("/api/races", raceRoutes.getRouter());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});