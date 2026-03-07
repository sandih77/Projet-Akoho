import express from "express";
import LotController from "../controllers/LotController.js";

export default class LotRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/create-lot", LotController.create);
  }

  getRouter() {
    return this.router;
  }
}