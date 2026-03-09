import express from "express";
import BilanController from "../controllers/BilanController.js";

export default class BilanRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get("/all", BilanController.getAllBilans);
    this.router.get("/", BilanController.getBilanByLotAndDate);
  }

  getRouter() {
    return this.router;
  }
}
