import { closeConnectionPool, getConnection, getConnectionPool, safeReleaseConnection } from './mysqlConnection.js';

import { PoolConnection } from 'mysql2/promise';
import { basicMySqlInsert } from './basicMySqlInsert.js';
import { connectionDetails } from './setup-tests.js';
import { deleteFromTable } from './deleteFromTable.js';
import { mysqlQuery } from './mysqlQuery.js';
import { verifyDatabaseReady } from './verifyDatabaseReady.js';

describe('basicMySqlInsert', () => {
  beforeAll(async () => {
    await verifyDatabaseReady(connectionDetails);
  });

  beforeAll(async () => {
    try {
      await getConnectionPool('basicMySqlInsert');
    } catch (err) {
      fail(err);
    }
  });

  beforeEach(async () => {
  });

  it('should insert a record', async () => {
    const testTagObjectId = 2345;
    const table = 'Tags';
    const testConnection: Promise<PoolConnection> = getConnection('basicMySqlInsert');
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
      const queryPromise = mysqlQuery(`SELECT * FROM ${table} WHERE objectId = ?`, [testTagObjectId], testConnection);
      await expect(queryPromise).resolves.not.toThrow();
      await testConnection;
      await expect (queryPromise).resolves.not.toThrow();
      return Promise.resolve();
    } catch (err) {
      console.error(`Error in test: ${err}`);
      throw err;
    } finally {
      if (safeReleaseConnection(connection)) {
        return Promise.resolve();
      } else {
        throw new Error("Failed to release connection in finally block.");
      }
    }
  });

  afterAll(async () => {
    await closeConnectionPool('basicMySqlInsert');
  });
});