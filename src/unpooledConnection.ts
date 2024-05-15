import { DEFAULT_CONNECTION_TIMEOUT, DEFAULT_MYSQL_PORT } from "./defaults.js";
import { booleanEnv, intEnv, loadEnv, requireEnv } from "@tjsr/simple-env-utils";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";

let connectionOptions: ConnectionOptions | undefined = undefined;

loadEnv({ silent: true });

// TODO: Default values don't need to be required from env because they could be overridden.  They only
// need to be required if they are not overridden.
export const defaultConnectionOptions: ConnectionOptions = {
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

export const getConnectionConfig = (): ConnectionOptions => {
  if (!connectionOptions) {
    loadEnv();

    connectionOptions = {
      ...defaultConnectionOptions,
    } as const;
  } else {
    console.debug('Database config already loaded');
  }

  return connectionOptions;
};

export const getUnpooledConnection = (connectionOptionsOverride?: ConnectionOptions): Promise<Connection> => {
  const connectionOptions = {
    ...defaultConnectionOptions,
    ...connectionOptionsOverride,
  } as const;
  
  return mysql.createConnection(connectionOptions).then((conn: mysql.Connection) => {
    return Promise.resolve(conn);
  }).catch((err) => {
    return Promise.reject(new Error(
      `Error connecting to ${connectionOptions.host}:${connectionOptions.port}/${connectionOptions.database}: ${err}`
    ));
  });
};
