import { ConnectionOptions, PoolOptions } from "mysql2";
import { getConnectionConfig, getDefaultConnectionOptions } from "./unpooledConnection.js";

import { intEnv } from "@tjsr/simple-env-utils";

let poolOptions: PoolOptions|undefined = undefined;
let defaultPoolOptions: PoolOptions;

const getDefaultPoolOptions = (): PoolOptions => {
  if (defaultPoolOptions === undefined) {
    defaultPoolOptions = {
      connectionLimit: intEnv('MYSQL_CONNECTION_POOL_SIZE', 5),
    } as const;
  }
  return defaultPoolOptions;
};

export const getPoolConfig = (poolConfigOverride?: PoolOptions): PoolOptions => {
  if (!poolOptions) {
    const connectionOptions: ConnectionOptions = getConnectionConfig();

    poolOptions = {
      ...getDefaultPoolOptions(),
      ...connectionOptions,
      ...poolConfigOverride,
    } as PoolOptions;
  }

  return poolOptions;
};

export const getPoolConnectionOption = (optionName: keyof ConnectionOptions): string => {
  if (poolOptions) {
    return (poolOptions as ConnectionOptions)[optionName];
  } else {
    return ({
      ...getDefaultConnectionOptions(),
      ...getDefaultPoolOptions() } as ConnectionOptions)[optionName];
  }
};
