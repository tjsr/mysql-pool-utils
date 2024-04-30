import { Connection, Pool, createPool } from "mysql2";

import { getPoolConfig } from "./getPoolConfig.js";

let connectionPool: Pool | undefined;

export const getCallbackConnectionPool = (): Pool => {
  if (undefined === connectionPool) {
      connectionPool = createPool(getPoolConfig());
  }
  return connectionPool;
};

export const getCallbackConnectionPromise = async (): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    try {
      getCallbackConnectionPool().getConnection((err, connection) => {
        if (err) {
          console.error('Failed getting connection from pool.', err);
          return reject(err);
        }
        return resolve(connection);
      });
    } catch (err) {
      console.error('Failed getting connection from pool.', err);
      return reject(err);
    }
  });
};

  // export const getConnection = async (): Promise<PoolConnection> => {
  //   return new Promise((resolve, reject) => {
  //     return getConnectionPool().then((pool: Pool) => {
  //       try {
  //         return pool.getConnection().then(resolve).catch(reject);
  //       } catch (mysqlError) {
  //         console.error('Error getting connection from pool with thrown exception.', mysqlError);
  //         return reject(mysqlError);
  //       }
  //     }).catch((poolError) => {
  //       console.error('Failed getting connection pool.', poolError);
  //       return reject(poolError);
  //     });
  //   });
  
// }
