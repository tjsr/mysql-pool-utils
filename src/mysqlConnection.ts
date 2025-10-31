import { Pool, PoolConnection, createPool } from 'mysql2/promise';

import { getPoolConfig } from './getPoolConfig.ts';

const connectionPools: Map<string, Promise<Pool>> = new Map<string, Promise<Pool>>();

// let connectionPool: Pool | undefined;
const illegalPoolNames: string[] = [];

export const setErrorWhenPoolNamed = (poolName: string): void => {
  illegalPoolNames.push(poolName);
};

export const getConnectionPool = async (poolName: string): Promise<Pool> => {
  if (!poolName) {
    console.trace('No pool name provided, using default.');
    return getConnectionPool('default');
  } else if (illegalPoolNames.includes(poolName)) {
    throw new Error (`Pool name ${poolName} is illegal.`);
  }
  if (connectionPools.has(poolName)) {
    return connectionPools.get(poolName)!;
  } else {
    const connectionPoolPromise: Promise<Pool> = new Promise(
      (resolve: (_value: Pool | PromiseLike<Pool>) => void, reject) => {
        try {
          const connectionPool: Pool = createPool(getPoolConfig());
          // console.trace(`Created connection pool for id ${poolName}`);
          return resolve(connectionPool);
        } catch (err) {
          console.error('Failed creating connection pool.', err);
          return reject(err);
        }
      });
    connectionPools.set(poolName, connectionPoolPromise);
    return connectionPoolPromise;
  }
};

export const safeReleaseConnection = (connection: PoolConnection|undefined): boolean => {
  if (connection !== undefined) {
    connection.release();
    return true;
  } else {
    // console.trace('Attempted to release an undefined connection object');
    return false;
  }
};

export const getConnection = async (poolName = 'default'): Promise<PoolConnection> => {
  return new Promise((resolve, reject) => {
    return getConnectionPool(poolName).then((pool: Pool) => {
      try {
        return pool.getConnection().then(resolve).catch(reject);
      } catch (mysqlError) {
        console.error('Error getting connection from pool with thrown exception.', mysqlError);
        return reject(mysqlError);
      }
    }).catch((poolError) => {
      console.error('Failed getting connection pool.', poolError);
      return reject(poolError);
    });
  });
};

export const closeConnectionPool = async (poolName = 'default'): Promise<void> => {
  if (!connectionPools.has(poolName)) {
    // console.debug('Attempted to close an undefined connection pool');
    return Promise.reject(new Error(`Attempted to close an undefined connection pool named ${poolName}`));
  } else {
    return new Promise((resolve, reject) => {
      if (isConnectionPoolOpen(poolName)) {
        // console.debug('Ended connection pool');
        const promisePoolEnd = connectionPools.get(poolName)!;

        return promisePoolEnd.then((pool) => {
          return pool.end().then(() => {
            // console.debug('Resolved from ending connection pool.');
            connectionPools.delete(poolName || 'default');
            return resolve();
          }).catch(reject);
        }).catch(reject);
      } else {
        // console.debug('Rejected because there was no connection pool.');
        return reject(new Error('Connection pool already closed when trying to end.'));
      }
    });
  }
};

export const isConnectionPoolOpen = (poolName = 'default'): boolean => {
  return connectionPools.has(poolName || 'default');
};

export const countOpenPools = (): number => {
  return connectionPools.size;
};

export const listOpenPools = (): string[] => {
  return Array.from(connectionPools.keys());
};
