import express from "express";
import AkohoMatyController from "../controllers/AkohoMatyController.js";

export default class AkohoMatyRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/create-akoho-maty", AkohoMatyController.create);
    this.router.get("/list-akoho-maty", AkohoMatyController.getAll);
  }

  getRouter() {
    return this.router;
  }
}
