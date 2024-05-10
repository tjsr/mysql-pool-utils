import { getConnection, safeReleaseConnection } from "./mysqlConnection.js";
import mysql, { Connection, FieldPacket, PoolConnection, QueryResult } from "mysql2/promise";

export const mysqlExecute = async (
  queryString: string, params: any, inputConnection?: Promise<Connection>): Promise<[QueryResult, FieldPacket[]]> => {
  const connection: PoolConnection|undefined = inputConnection != undefined ? undefined : await getConnection();
  const useConnection = await (inputConnection || connection);

  return new Promise((resolve, reject) => {
    useConnection!.execute({ rowsAsArray: true, sql: mysql.format(queryString, [params]) })
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
