import { Settings } from "luxon";
const fs = require("fs");
const path = require("path");

try {
  fs.accessSync(path.resolve(__dirname, "bot.env"));
  require("dotenv").config({ path: path.resolve(__dirname, "bot.env") });
} catch (e) {
  throw new Error("bot.env required");
}

Settings.defaultZone = "utc";

const entities = path.relative(process.cwd(), path.resolve(__dirname, "dist/data/entities/*.js"));
const migrations = path.relative(process.cwd(), path.resolve(__dirname, "dist/migrations/*.js"));
const migrationsDir = path.relative(process.cwd(), path.resolve(__dirname, "src/migrations"));

export default {
  type: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  synchronize: false,
  connectTimeout: 2000,

  logging: ["error", "warn"],

  // Entities
  entities: [entities],

  // Pool options
  extra: {
    typeCast(field, next) {
      if (field.type === "DATETIME") {
        const val = field.string();
        return val != null ? moment.utc(val).format("YYYY-MM-DD HH:mm:ss") : null;
      }

      return next();
    },
  },

  // Migrations
  migrations: [migrations],
  cli: {
    migrationsDir,
  },
};
