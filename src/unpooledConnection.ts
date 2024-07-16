import { DEFAULT_CONNECTION_TIMEOUT, DEFAULT_MYSQL_PORT } from "./defaults.js";
import { booleanEnv, intEnv, requireEnv } from "@tjsr/simple-env-utils";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";

let connectionOptions: ConnectionOptions | undefined = undefined;
let defaultConnectionOptions: ConnectionOptions;

// TODO: Default values don't need to be required from env because they could be overridden.  They only
// need to be required if they are not overridden.
export const getDefaultConnectionOptions = (): ConnectionOptions => {
  if (defaultConnectionOptions === undefined) {
    defaultConnectionOptions = {
      bigNumberStrings: true,
      connectTimeout: intEnv('MYSQL_CONNECT_TIMEOUT', DEFAULT_CONNECTION_TIMEOUT),
      database: requireEnv('MYSQL_DATABASE'),
      debug: booleanEnv('MYSQL_DEBUG', false),
      host: requireEnv('MYSQL_HOST'),
      password: requireEnv('MYSQL_PASSWORD'),
      port: intEnv('MYSQL_PORT', DEFAULT_MYSQL_PORT),
      supportBigNumbers: true,
      user: requireEnv('MYSQL_USER'),
    } as const;
  }
  return defaultConnectionOptions;
};

export const getConnectionConfig = (): ConnectionOptions => {
  if (!connectionOptions) {
    connectionOptions = {
      ...getDefaultConnectionOptions(),
    } as const;
  } else {
    console.debug('Database config already loaded');
  }

  return connectionOptions;
};

export const getUnpooledConnection = (connectionOptionsOverride?: ConnectionOptions): Promise<Connection> => {
  const connectionOptions = {
    ...getDefaultConnectionOptions(),
    ...connectionOptionsOverride,
  } as const;
  
  const connectionDetailString = `${connectionOptions.host}:${connectionOptions.port}/${connectionOptions.database}`;
  return mysql.createConnection(connectionOptions).then((conn: mysql.Connection) => {
    console.debug(getUnpooledConnection, `Got unpooled connection to ${connectionDetailString}.`);
    return Promise.resolve(conn);
  }).catch((err) => {
    console.warn(`Error connecting to ${connectionDetailString}: ${err}`);
    return Promise.reject(new Error(
      `Error connecting to ${connectionOptions.host}:${connectionOptions.port}/${connectionOptions.database}: ${err}`
    ));
  });
};
