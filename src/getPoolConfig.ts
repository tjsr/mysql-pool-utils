import { ConnectionOptions, PoolOptions } from "mysql2";
import { intEnv, loadEnvWithDebug } from "@tjsr/simple-env-utils";

import { getConnectionConfig } from "./unpooledConnection.js";

let poolOptions: PoolOptions|undefined = undefined;

export const getPoolConfig = (poolConfigOverride?: PoolOptions): PoolOptions => {
  if (!poolOptions) {
    loadEnvWithDebug();

    let connectionOptions: ConnectionOptions = getConnectionConfig();

    const defaultPoolOptions: PoolOptions = {
      connectionLimit: intEnv('MYSQL_CONNECTION_POOL_SIZE', 5),
    } as const;

    poolOptions = {
      ...defaultPoolOptions,
      ...connectionOptions,
      ...poolConfigOverride,
    } as const;
  } else {
    console.debug('Pool database config already loaded');
  }

  return poolOptions;
};
