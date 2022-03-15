import { spawn, Worker, Pool } from "threads";
import "../loadEnv";
import { MINUTES } from "./utils";

if (!process.env.KEY) {
  /* eslint-disable no-console */
  console.error("Environment value KEY required for encryption");
  process.exit(1);
}

const KEY = process.env.KEY;
const pool = Pool(() => spawn(new Worker("./cryptWorker"), { timeout: 10 * MINUTES }), 8);

export async function encrypt(data: string) {
  return pool.queue((w) => w.encrypt(data, KEY));
}

export async function decrypt(data: string) {
  return pool.queue((w) => w.decrypt(data, KEY));
}
