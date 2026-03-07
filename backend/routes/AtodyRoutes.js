import express from "express";
import AtodyController from "../controllers/AtodyController.js";

export default class AtodyRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/create-atody", AtodyController.create);
    this.router.get("/list-atody", AtodyController.getAll);
  }

  getRouter() {
    return this.router;
  }
}
