import { ConnectionOptions, PoolOptions } from "mysql2";
import { defaultConnectionOptions, getConnectionConfig } from "./unpooledConnection.js";
import { intEnv, loadEnv } from "@tjsr/simple-env-utils";

let poolOptions: PoolOptions|undefined = undefined;

const defaultPoolOptions: PoolOptions = {
  connectionLimit: intEnv('MYSQL_CONNECTION_POOL_SIZE', 5),
} as const;

export const getPoolConfig = (poolConfigOverride?: PoolOptions): PoolOptions => {
  if (!poolOptions) {
    loadEnv();

    const connectionOptions: ConnectionOptions = getConnectionConfig();

    poolOptions = {
      ...defaultPoolOptions,
      ...connectionOptions,
      ...poolConfigOverride,
    } as PoolOptions;
  }

  return poolOptions;
};

export const getPoolConnectionOption = (optionName: string): string => {
  if (poolOptions) {
    return (poolOptions as any)[optionName];
  } else {
    return ({
      ...defaultConnectionOptions,
      ...defaultPoolOptions } as any)[optionName];
  }
};
