"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const sequelize = require('../src/config/database');
async function testReviews() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SHOW COLUMNS FROM reviews');
        console.table(results);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Gagal membaca tabel reviews:', message);
    }
    finally {
        await sequelize.close();
    }
}
testReviews();
