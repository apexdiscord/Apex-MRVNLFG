const fs = require('fs');
const path = require('path');

try {
    fs.accessSync(path.resolve(__dirname, 'bot.env'));
    require('dotenv').config({ path: path.resolve(__dirname, 'bot.env') });
} catch (e) {
    throw new Error("bot.env required");
}

const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

const entities = path.relative(process.cwd(), path.resolve(__dirname, 'dist/data/entities/*.js'));
const migrations = path.relative(process.cwd(), path.resolve(__dirname, 'dist/migrations/*.js'));
const migrationsDir = path.relative(process.cwd(), path.resolve(__dirname, 'src/migrations'));

module.exports = {
    type: "sqlite",
    database: "./mrvnDatabase.sqlite",
    synchronize: false,

    // Entities
    entities: [entities],

    // Migrations
    migrations: [migrations],
    cli: {
        migrationsDir,
    },
    migrationsRun: true,
};
