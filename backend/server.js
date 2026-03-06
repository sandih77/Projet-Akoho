const express = require('express');
const { connectDB } = require('./config/db');

const app = express();

connectDB();

app.listen(3000, () => {
    console.log("Serveur lancé sur le port 3000");
});