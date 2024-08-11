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

const dbConnString = (connectionOptions: ConnectionOptions): string => {
  return `${connectionOptions.host}:${connectionOptions.port}/${connectionOptions.database}`;
};

export const getUnpooledConnection = (connectionOptionsOverride?: ConnectionOptions): Promise<Connection> => {
  const connectionOptions = {
    ...getDefaultConnectionOptions(),
    ...connectionOptionsOverride,
  } as const;
  
  const connectionDetailString = dbConnString(connectionOptions);
  return mysql.createConnection(connectionOptions).then((conn: mysql.Connection) => {
    const connectionMessage = `Got unpooled connection to ${connectionDetailString}.`;
    console.debug(getUnpooledConnection, connectionMessage);
    return Promise.resolve(conn);
  }).catch((err) => {
    const errMsgString = `Error connecting to ${connectionDetailString}: [${err.code}] ${err.message}`;
    console.warn(getUnpooledConnection, errMsgString);
    return Promise.reject(err);
  });
};
