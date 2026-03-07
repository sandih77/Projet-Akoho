import express from "express";
import EclosionController from "../controllers/EclosionController.js";

export default class EclosionRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/create-eclosion", EclosionController.create);
    this.router.get("/list-eclosion", EclosionController.getAll);
  }

  getRouter() {
    return this.router;
  }
}
