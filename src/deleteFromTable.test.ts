import { FieldPacket, PoolConnection, QueryResult } from "mysql2/promise";
import { closeConnectionPool, getConnection, getConnectionPool, isConnectionPoolOpen, safeReleaseConnection } from "./mysqlConnection.js";

import { basicMySqlInsert } from "./basicMySqlInsert.js";
import { connectionDetails } from './setup-tests.js';
import { deleteFromTable } from "./deleteFromTable.js";
import { mysqlQuery } from "./mysqlQuery.js";
import { verifyDatabaseReady } from './verifyDatabaseReady.js';

describe('deleteFromTable', () => {
  beforeAll(async () => {
    await verifyDatabaseReady(connectionDetails);
  });

  beforeAll(async () => {
    await getConnectionPool('deleteFromTable');
  });

  it('Should remove values from a table', async() => {
    const testTagObjectId = 2345;
    const table = 'Tags';
    const testConnection: Promise<PoolConnection> = getConnection();
    const connection = await testConnection;

    try {
      const rowsDeleted = await deleteFromTable(table, { objectId: testTagObjectId }, testConnection);
      expect(rowsDeleted).toBeGreaterThanOrEqual(0);
  
      // Arrange
      const fields = ['objectId', 'tag', 'createdByUserId'];
      const values = {
        objectId: testTagObjectId,
        tag: 'test',
        createdByUserId: 'user' + testTagObjectId,
      };
  
      await expect(basicMySqlInsert(table, fields, values, testConnection)).resolves.not.toThrow();
      const testRowsDeleted = await deleteFromTable(table, { objectId: testTagObjectId }, testConnection);
      expect(testRowsDeleted).toBe(1);

      const queryResultsPromise = mysqlQuery(`SELECT * FROM ${table} WHERE objectId = ?`, [testTagObjectId], testConnection);
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
    if (isConnectionPoolOpen('basicMySqlInsert')) {
      await closeConnectionPool('deleteFromTable');
    }
  });
});