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
    console.debug(`Attempting to reattempt connection to database ${maxRetries} times...`);
    let retries = 0;
    const tryGetConnection = async () => {
      try {
        const connection = await getUnpooledConnection(connectionOptionOverrides); 
        console.debug('Got connection...');
        return resolve(connection);
      } catch (err) {
        console.info(`Retrying connection ${retries}/${maxRetries}: ${err}`);
        if (retries >= maxRetries) {
          console.warn(`Failed to get connection after ${retries} retries: ${err}`);
          return reject(err);
        }
        const timeSinceStart = Date.now() - startTime;
        if (timeSinceStart > timeoutMilliseconds) {
          console.warn(`Timed out - exceeded maximum time ${timeoutMilliseconds} ` +
            `for retries (${retries}/${maxRetries}): ${err}`);
          return reject(new Error(
            `Timed out - exceeded maximum time ${timeoutMilliseconds} for retries (${retries}/${maxRetries}): ${err}`
          ));
        }
        retries++;
        setTimeout(tryGetConnection, reattemptDelayMilliseconds);
      }
    };
    tryGetConnection();
  });
};
