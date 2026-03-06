import express from "express";
import LotController from "../controllers/LotController";
const router = express.Router();

router.post("/create-lot", LotController.create);

export default router;