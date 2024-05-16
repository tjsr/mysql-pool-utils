import { getConnection, safeReleaseConnection } from './mysqlConnection.js';
import mysql, { PoolConnection } from 'mysql2/promise';

export const basicMySqlInsert = async (
  table: string,
  _fields: string[],
  values: any,
  inputConnection?: Promise<PoolConnection>
): Promise<void> => {
  if (values === undefined) {
    return Promise.reject(new Error(`Values must be defined, got undefined parameter`));
  }

  const connectionPromise: Promise<PoolConnection> | undefined = inputConnection !== undefined
    ? inputConnection : getConnection();
  const connection: PoolConnection|undefined = inputConnection != undefined ? undefined : await connectionPromise;

  return new Promise((resolve, reject) => {
    return connectionPromise!
      .then(async (conn: PoolConnection) => {
        const query = mysql.format(`INSERT INTO \`${table}\` SET ?`, [values]);
        console.debug(`Executing query: ${query}`);
        return conn.execute(query).then(() => {
          safeReleaseConnection(connection);
          return resolve();
        }).catch((err) => {
          safeReleaseConnection(connection);
          if (err && err.sqlState === '23000') {
            console.error('Failed inserting with primary key violation');
            return reject(err);
          } else if (err) {
            console.error(`Error inserting into ${table}: ${err}`, err);
            return reject(err);
          }
          console.error(`Got rejected exception while executing an insert, but exception had no err??!`);
          return reject(err);
        });
      }).catch(reject);
  });
};
