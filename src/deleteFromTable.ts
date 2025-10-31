import { Connection, FieldPacket, QueryResult, ResultSetHeader } from 'mysql2/promise';

import { mysqlExecute } from './mysqlExecute.ts';

export const deleteFromTable = (
  table: string, whereClause: object, inputConnection?: Promise<Connection>
): Promise<number> => {
  if (whereClause == undefined) {
    return Promise.reject(new Error(`whereClause is undefined`));
  }
  if (table == undefined) {
    return Promise.reject(new Error(`table is undefined`));
  }
  return mysqlExecute(
    `DELETE FROM \`${table}\` WHERE ?`, whereClause, inputConnection
  ).then((results: [QueryResult, FieldPacket[]]) => {
    const queryResult: QueryResult = results[0] as QueryResult;
    const rsh = queryResult as ResultSetHeader;
    return Promise.resolve(rsh.affectedRows);
  });
};
