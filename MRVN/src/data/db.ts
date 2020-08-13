import { createConnection, Connection } from "typeorm";

export let connection: Connection;

export async function connect() {
  if (!connection) {
    connection = await createConnection();
  }
}
