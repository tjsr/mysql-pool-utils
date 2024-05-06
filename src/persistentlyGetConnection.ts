import { Connection, ConnectionOptions } from "mysql2/promise";

import { getUnpooledConnection } from "./unpooledConnection.js";

export const persistentlyGetConnection = async (
  connectionOptionOverrides: ConnectionOptions,
  maxRetries: number,
  reattemptDelayMilliseconds = 500,
  timeoutMilliseconds = 10000
): Promise<Connection> => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    let retries = 0;
    const tryGetConnection = async () => {
      try {
        const connection = await getUnpooledConnection(connectionOptionOverrides); 
        return resolve(connection);
      } catch (err) {
        if (retries >= maxRetries) {
          return reject(err);
        }
        const timeSinceStart = Date.now() - startTime;
        if (timeSinceStart > timeoutMilliseconds) {
          return reject(new Error(`Timed out - exceeded maximum time ${timeoutMilliseconds} for retries (${retries}/${maxRetries}): ${err}`));
        }
        retries++;
        setTimeout(tryGetConnection, reattemptDelayMilliseconds);
      }
    };
    tryGetConnection();
  });
};