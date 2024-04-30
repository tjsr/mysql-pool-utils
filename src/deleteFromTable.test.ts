import { FieldPacket, PoolConnection, QueryResult } from "mysql2/promise";
import { closeConnectionPool, getConnection, getConnectionPool, safeReleaseConnection } from "./mysqlConnection";

import { basicMySqlInsert } from "./basicMySqlInsert";
import { connectionDetails } from './setup-tests.js';
import { createConnection } from "net";
import { deleteFromTable } from "./deleteFromTable";
import { mysqlQuery } from "./mysqlQuery";
import { verifyDatabaseReady } from './verifyDatabaseReady.js';

describe('deleteFromTable', () => {
  beforeAll(async () => {
    try {
      await verifyDatabaseReady(connectionDetails);
    } catch (err) {
      fail(err);
    }
  });

  beforeAll(async () => {
    try {
      await getConnectionPool('deleteFromTable');
    } catch (err) {
      fail(err);
    }
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
    await closeConnectionPool('deleteFromTable');
  });
});