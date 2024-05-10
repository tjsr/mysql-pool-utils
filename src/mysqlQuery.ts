import { Connection, FieldPacket, PoolConnection, QueryResult } from "mysql2/promise";
import { getConnection, safeReleaseConnection } from "./mysqlConnection.js";

const useExistingOrCreateNewConnection = (inputConnection: Promise<Connection>|undefined, poolName: string):
  [Promise<Connection>|undefined, Promise<PoolConnection>|undefined] => {
  if (inputConnection !== undefined) {
    return [inputConnection, undefined];
  }
  const newPoolConnection = getConnection(poolName);
  // let connection: PoolConnection|undefined = inputConnection != inputConnection ?
  //  undefined : await getConnection(poolName);
  // const useConnection = await (inputConnection) || connection;
  return [undefined, newPoolConnection];
};

export const mysqlQuery = async (
  queryString: string, params: (
    string|boolean|bigint|number)[], inputConnection?: Promise<Connection>, poolName = 'default'
): Promise<[QueryResult, FieldPacket[]]> => {
  // let connection: PoolConnection|undefined = inputConnection != inputConnection ?
  // undefined : await getConnection(poolName);
  // const useConnection = await (inputConnection) || connection;
  const [useConnection, newPoolConnection] = useExistingOrCreateNewConnection(inputConnection, poolName);
  const readyNewConnection = await newPoolConnection;
  const effectiveConnection = await (useConnection || newPoolConnection);
  
  return new Promise((resolve, reject) => {
    effectiveConnection!.query({ rowsAsArray: true, sql: queryString }, params)
      .then((results: [QueryResult, FieldPacket[]]) => {
        safeReleaseConnection(readyNewConnection);
        if (results == undefined) {
          return reject(
            new Error(
              `Simple query result was undefined.`
            )
          );
        }

        return resolve(results);
      }).catch((err) => {
        safeReleaseConnection(readyNewConnection);
        return reject(err);
      });
  });
};
