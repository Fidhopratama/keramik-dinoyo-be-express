"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app = require('./app');
const sequelize = require('./config/database');
const PORT = process.env.PORT || 5050;
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('MySQL berhasil terhubung.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Keramik Dinoyo API listening on port ${PORT}.`);
        });
    }
    catch {
        console.error('Server startup failed; check application configuration.');
        process.exit(1);
    }
}
startServer();
