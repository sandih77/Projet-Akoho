import express from "express";
import ConfigurationController from "../controllers/ConfigurationController.js";

export default class ConfigurationRoutes {
    constructor() {
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/create-configuration", ConfigurationController.create);
        this.router.get("/list-configurations", ConfigurationController.getAll);
        this.router.get("/by-lot/:lot_id", ConfigurationController.getByLot);
        this.router.delete("/delete/:id", ConfigurationController.deleteById);
    }

    getRouter() {
        return this.router;
    }
}
