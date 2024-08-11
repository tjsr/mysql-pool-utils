import { Connection, ConnectionOptions } from "mysql2/promise";

import { getUnpooledConnection } from "./unpooledConnection.js";

const createTimeoutMessage = (
  retries:number, maxRetries: number, timeoutMilliseconds: number, error: Error
): string => {
  let timeoutMessage = `Timed out - exceeded maximum time ${timeoutMilliseconds} ` +
    `for retries (${retries}/${maxRetries})`;
  const codeMessage = error.message ? `: ${error.message}` : '';
  timeoutMessage += codeMessage;

  return timeoutMessage;
};

export const persistentlyGetConnection = async (
  connectionOptionOverrides: ConnectionOptions,
  maxRetries: number,
  reattemptDelayMilliseconds = 500,
  timeoutMilliseconds = 10000
): Promise<Connection> => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    console.debug(persistentlyGetConnection, `Attempting to reattempt connection to database ${maxRetries} times...`);
    let retries = 0;
    const tryGetConnection = async () => {
      try {
        const connection = await getUnpooledConnection(connectionOptionOverrides); 
        console.debug(persistentlyGetConnection, 'Got connection...');
        return resolve(connection);
      } catch (err) {
        console.info(`Retrying connection ${retries}/${maxRetries}: ${err}`);
        if (retries >= maxRetries) {
          console.warn(persistentlyGetConnection, `Failed to get connection after ${retries} retries: ${err}`);
          return reject(err);
        }
        const timeSinceStart = Date.now() - startTime;
        if (timeSinceStart > timeoutMilliseconds) {
          const timeoutMessage = createTimeoutMessage(retries, maxRetries, timeoutMilliseconds, err as Error);

          console.warn(persistentlyGetConnection, timeoutMessage);
          return reject(new Error(
            timeoutMessage, { cause: err }
          ));
        }
        retries++;
        setTimeout(tryGetConnection, reattemptDelayMilliseconds);
      }
    };
    tryGetConnection();
  });
};
