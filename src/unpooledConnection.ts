import { booleanEnv, intEnv, loadEnvWithDebug, requireEnv } from "@tjsr/simple-env-utils";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";

let connectionOptions: ConnectionOptions | undefined = undefined;

export const defaultConnectionOptions: ConnectionOptions = {
  bigNumberStrings: true,
  connectTimeout: intEnv('MYSQL_CONNECT_TIMEOUT', 2000),
  database: requireEnv('MYSQL_DATABASE'),
  debug: booleanEnv('MYSQL_DEBUG', false),
  host: requireEnv('MYSQL_HOST'),
  password: requireEnv('MYSQL_PASSWORD'),
  port: intEnv('MYSQL_PORT', 3306),
  supportBigNumbers: true,
  user: requireEnv('MYSQL_USER'),
} as const;

export const getConnectionConfig = (): ConnectionOptions => {
  if (!connectionOptions) {
    loadEnvWithDebug();

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
    ...connectionOptionsOverride
  } as const;
  
  return mysql.createConnection(connectionOptions).then((conn: mysql.Connection) => {
    return Promise.resolve(conn);
  }).catch((err) => {
    return Promise.reject(`Error connecting to ${connectionOptions.host}:${connectionOptions.port}/${connectionOptions.database}: ${err}`);
  });
};
