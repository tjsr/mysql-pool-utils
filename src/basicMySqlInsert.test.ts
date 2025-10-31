import { FieldPacket, PoolConnection, QueryResult } from 'mysql2/promise';
import {
  closeConnectionPool,
  countOpenPools,
  getConnection,
  getConnectionPool,
  isConnectionPoolOpen,
  listOpenPools,
  safeReleaseConnection,
  setErrorWhenPoolNamed
} from './mysqlConnection.ts';
import { generateTestIdNumber, mysqlConnectionString } from './testUtils.ts';

import { TestContext } from 'vitest';
import { basicMySqlInsert } from './basicMySqlInsert.ts';
import { connectionDetails } from './setup-tests.ts';
import { deleteFromTable } from './deleteFromTable.ts';
import { mysqlQuery } from './mysqlQuery.ts';
import { verifyDatabaseReady } from './verifyDatabaseReady.ts';

describe('basicMySqlInsert', () => {
  beforeAll(async () => {
    setErrorWhenPoolNamed('default');
    console.log(`Running tests against database ${mysqlConnectionString(connectionDetails)}`);
    await verifyDatabaseReady(connectionDetails);
  });

  beforeAll(async () => {
    await getConnectionPool('basicMySqlInsert');
    // try {
    //   const pool = 
    // } catch (err: any) {
    //   fail('Failed in set-up trying to get connection pool', + err);
    // }
  });

  beforeEach(async (t: TestContext & object) => {
    // TODO: Fix this to use the correct type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t.onTestFailed((f: any): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (f.errors?.find((e: any) => e.code === 'ECONNREFUSED')) {
        console.error(`Failed connecting to database`);
      }
    });
  });

  test('should insert a record', async () => {
    const testTagObjectId = generateTestIdNumber('basicMysqlInsert'); // 2345;
    const table = 'Tags';
    const testConnection: Promise<PoolConnection> = getConnection('basicMySqlInsert');
    const connection = await testConnection;

    try {
      const initialQueryPromise: Promise<[QueryResult, FieldPacket[]]> = mysqlQuery(
        `SELECT * FROM ${table} WHERE objectId = ?`, [testTagObjectId], testConnection
      );
      await expect(initialQueryPromise).resolves.not.toThrow();
      const initialQueryResults: [QueryResult, FieldPacket[]] = await initialQueryPromise;
      const currentMatchingRows = (initialQueryResults[0] as []).length;

      const rowsDeleted = await deleteFromTable(table, { objectId: testTagObjectId }, testConnection);
      expect(rowsDeleted).toBeGreaterThanOrEqual(0);
      expect(rowsDeleted).toEqual(currentMatchingRows);
  
      // Arrange
      const fields = ['objectId', 'tag', 'createdByUserId'];
      const values = {
        createdByUserId: 'user' + testTagObjectId,
        objectId: testTagObjectId,
        tag: 'test',
      };
  
      await expect(basicMySqlInsert(table, fields, values, testConnection)).resolves.not.toThrow();
      const queryPromise: Promise<[QueryResult, FieldPacket[]]> = mysqlQuery(
        `SELECT * FROM ${table} WHERE objectId = ?`, [testTagObjectId], testConnection
      );
      await expect(queryPromise).resolves.not.toThrow();
      await queryPromise;
      // await testConnection;
      // await expect(queryPromise).resolves.not.toThrow();
      if (safeReleaseConnection(connection)) {
        return Promise.resolve();
      } else {
        throw new Error("Failed to release connection in finally block.");
      }
    } catch (err) {
      safeReleaseConnection(connection);
      console.error(`Error in test: ${err}`);
      throw err;
    }
  });

  afterAll(async () => {
    if (isConnectionPoolOpen('basicMySqlInsert')) {
      await closeConnectionPool('basicMySqlInsert');
    }
    expect(isConnectionPoolOpen('default')).toBe(false);

    if (isConnectionPoolOpen('default')) {
      await closeConnectionPool('default');
    }
    const openPools = countOpenPools();
    const poolNames = listOpenPools().join(', ');
    if (openPools > 0) {
      console.warn(`${openPools} connection pools for ${poolNames} remain open.`);
    }
  });
});
