import { Connection, ConnectionOptions } from "mysql2/promise";

import { mysqlQuery } from "./mysqlQuery.js";
import { persistentlyGetConnection } from "./persistentlyGetConnection.js";

export const verifyDatabaseReady = async (connectionDetails: ConnectionOptions): Promise<void> => {
  const connectionPromise: Promise<Connection> = persistentlyGetConnection(connectionDetails, 10, 200, 1000);
  return new Promise<void>((resolve, reject) => {
    connectionPromise.then((conn) => {
      mysqlQuery('SELECT 1', [], connectionPromise).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      }).finally(() => {
        conn.end();
      });
    }).catch((err) => {
      return reject(err);
    });
  });
};
