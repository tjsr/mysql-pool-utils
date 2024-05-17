import { Connection, ConnectionOptions } from "mysql2/promise";

import { intEnv } from "@tjsr/simple-env-utils";
import { mysqlQuery } from "./mysqlQuery.js";
import { persistentlyGetConnection } from "./persistentlyGetConnection.js";

const databaseCheckRetries = intEnv('DATABASE_CHECK_RETRIES', 10);
const databaseCheckDelay = intEnv('DATABASE_CHECK_DELAY', 200);
const databaseTimeout = intEnv('DATABASE_TIMEOUT', databaseCheckDelay*(databaseCheckRetries+1));

export const verifyDatabaseReady = async (connectionDetails: ConnectionOptions): Promise<void> => {
  const connectionPromise: Promise<Connection> = persistentlyGetConnection(
    connectionDetails, databaseCheckRetries, databaseCheckDelay, databaseTimeout);
  return new Promise<void>((resolve, reject) => {
    mysqlQuery('SELECT 1', [], connectionPromise).then(() => {
      console.log(`Database at ${connectionDetails.host}/${connectionDetails.database} is ready.`);
      return resolve();
    }).catch((err) => {
      return reject(err);
    }).finally(() => {
      connectionPromise.then((conn) => {
        if (conn !== undefined) {
          conn.end();
        }
      });
    });
  });
};
