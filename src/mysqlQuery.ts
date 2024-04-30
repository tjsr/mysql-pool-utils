import { Connection, FieldPacket, PoolConnection, QueryResult } from "mysql2/promise";
import { getConnection, safeReleaseConnection } from "./mysqlConnection.js";

export const mysqlQuery = async (
  queryString: string, params: (string|boolean|bigint|number)[], inputConnection?: Promise<Connection>): Promise<[QueryResult, FieldPacket[]]> => {
  let connection: PoolConnection|undefined = inputConnection != inputConnection ? undefined : await getConnection();
  const useConnection = await (inputConnection || connection);
  
  return new Promise((resolve, reject) => {
    useConnection!.query({ sql: queryString, rowsAsArray: true }, params)
      .then((results: [QueryResult, FieldPacket[]]) => {
        safeReleaseConnection(connection);
        if (results == undefined) {
          return reject(
            new Error(
              `Simple query result was undefined.`
            )
          );
        }

        return resolve(results);
    }).catch((err) => {
      safeReleaseConnection(connection);
      return reject(err);
    });
  });
};