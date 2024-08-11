import {
  FieldPacket,
  PoolConnection,
  QueryResult
} from "mysql2/promise";
import {
  closeConnectionPool,
  getConnection,
  getConnectionPool,
  isConnectionPoolOpen,
  safeReleaseConnection,
  setErrorWhenPoolNamed
} from "./mysqlConnection.js";
import { generateTestIdNumber, mysqlConnectionString } from "./testUtils.js";

import { basicMySqlInsert } from "./basicMySqlInsert.js";
import { connectionDetails } from './setup-tests.js';
import { deleteFromTable } from "./deleteFromTable.js";
import { mysqlQuery } from "./mysqlQuery.js";
import { verifyDatabaseReady } from './verifyDatabaseReady.js';

describe('deleteFromTable', () => {
  beforeAll(async () => {
    setErrorWhenPoolNamed('default');
    console.log(`Running tests against database ${mysqlConnectionString(connectionDetails)}`);
    await verifyDatabaseReady(connectionDetails);
  });

  beforeAll(async () => {
    await getConnectionPool('deleteFromTable');
  });

  test('Should remove values from a table', async() => {
    const testTagObjectId = generateTestIdNumber('deleteFromTable');
    const table = 'Tags';
    const testConnection: Promise<PoolConnection> = getConnection('deleteFromTable');
    const connection = await testConnection;

    try {
      const rowsDeleted = await deleteFromTable(table, { objectId: testTagObjectId }, testConnection);
      expect(rowsDeleted).toBeGreaterThanOrEqual(0);
  
      // Arrange
      const fields = ['objectId', 'tag', 'createdByUserId'];
      const values = {
        createdByUserId: 'user' + testTagObjectId,
        objectId: testTagObjectId,
        tag: 'test',
      };
  
      await expect(basicMySqlInsert(table, fields, values, testConnection)).resolves.not.toThrow();
      const testRowsDeleted = await deleteFromTable(table, { objectId: testTagObjectId }, testConnection);
      expect(testRowsDeleted).toBe(1);

      const queryResultsPromise = mysqlQuery(
        `SELECT * FROM ${table} WHERE objectId = ?`,[testTagObjectId], testConnection
      );
      await expect(queryResultsPromise).resolves.not.toThrow();

      const queryResults: [QueryResult, FieldPacket[]] = await queryResultsPromise;
      expect(queryResults[0]).toStrictEqual([]);
      return Promise.resolve();
    } catch (err) {
      console.error(`Error in test: ${err}`);
      throw err;
    } finally {
      safeReleaseConnection(connection);
    }
  });

  afterAll(async () => {
    if (isConnectionPoolOpen('deleteFromTable')) {
      await closeConnectionPool('deleteFromTable');
    }
    expect(isConnectionPoolOpen('default')).toBe(false);
  });
});
