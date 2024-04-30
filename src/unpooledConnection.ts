import { booleanEnv, intEnv, isTestMode, loadEnvWithDebug, requireEnv } from "@tjsr/simple-env-utils";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";

let connectionOptions: ConnectionOptions | undefined = undefined;

export const getConnectionConfig = (): ConnectionOptions => {
  if (!connectionOptions) {
    loadEnvWithDebug();

    connectionOptions = {
      bigNumberStrings: true,
      connectTimeout: intEnv('MYSQL_CONNECT_TIMEOUT', 2000),
      database: requireEnv('MYSQL_DATABASE'),
      debug: booleanEnv('MYSQL_DEBUG', false),
      host: requireEnv('MYSQL_HOST'),
      password: requireEnv('MYSQL_PASSWORD'),
      port: isTestMode() ? 23407 : intEnv('MYSQL_PORT', 3306),
      supportBigNumbers: true,
      user: requireEnv('MYSQL_USER'),
    } as const;
  } else {
    console.debug('Database config already loaded');
  }

  return connectionOptions;
};

export const getUnpooledConnection = (connectionOptionsOverride?: ConnectionOptions): Promise<Connection> => {
  const defaultConnectionOptions: ConnectionOptions = {
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

  const connectionOptions = {
    ...defaultConnectionOptions,
    ...connectionOptionsOverride
  } as const;

  // console.log('Creating connection with options:', connectionOptions);
  return mysql.createConnection(connectionOptions);
};