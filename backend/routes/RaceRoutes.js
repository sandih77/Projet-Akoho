import express from 'express';
import RaceController from '../controllers/RaceController.js';

export default class RaceRoutes {
    constructor() {
        this.router = express.Router();
        this.initRoutes();
    }

    initRoutes() {
        this.router.post('/create-race', RaceController.create);
        this.router.get('/list-races', RaceController.getAll);
    }

    getRouter() {
        return this.router;
    }
}