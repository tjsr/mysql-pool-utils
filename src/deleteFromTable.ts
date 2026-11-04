import { Connection, FieldPacket, QueryResult, ResultSetHeader, escapeId } from 'mysql2/promise';

import { mysqlQuery } from './mysqlQuery.ts';

export const deleteFromTable = (
  table: string, whereClause: object, inputConnection?: Promise<Connection>
): Promise<number> => {
  if (whereClause == undefined) {
    return Promise.reject(new Error(`whereClause is undefined`));
  }
  if (table == undefined) {
    return Promise.reject(new Error(`table is undefined`));
  }
  const conditions = Object.entries(whereClause);
  if (conditions.length === 0) {
    return Promise.reject(new Error('whereClause must contain at least one condition'));
  }
  const predicates = conditions.map(([column]) => `${escapeId(column)} = ?`).join(' AND ');
  const values = conditions.map(([, value]) => value);
  return mysqlQuery(
    `DELETE FROM ${escapeId(table)} WHERE ${predicates}`, values, inputConnection
  ).then((results: [QueryResult, FieldPacket[]]) => {
    const queryResult: QueryResult = results[0] as QueryResult;
    const rsh = queryResult as ResultSetHeader;
    return Promise.resolve(rsh.affectedRows);
  });
};
