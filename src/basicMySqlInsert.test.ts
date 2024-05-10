import {
  closeConnectionPool,
  countOpenPools,
  getConnection,
  getConnectionPool,
  isConnectionPoolOpen,
  listOpenPools,
  safeReleaseConnection,
  setErrorWhenPoolNamed
} from './mysqlConnection.js';

import { PoolConnection } from 'mysql2/promise';
import { basicMySqlInsert } from './basicMySqlInsert.js';
import { connectionDetails } from './setup-tests.js';
import { deleteFromTable } from './deleteFromTable.js';
import { mysqlQuery } from './mysqlQuery.js';
import { verifyDatabaseReady } from './verifyDatabaseReady.js';

describe('basicMySqlInsert', () => {
  beforeAll(async () => {
    setErrorWhenPoolNamed('default');
    await verifyDatabaseReady(connectionDetails);
  });

  beforeAll(async () => {
    await getConnectionPool('basicMySqlInsert');
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
        createdByUserId: 'user' + testTagObjectId,
        objectId: testTagObjectId,
        tag: 'test',
      };
  
      await expect(basicMySqlInsert(table, fields, values, testConnection)).resolves.not.toThrow();
      const queryPromise = mysqlQuery(`SELECT * FROM ${table} WHERE objectId = ?`, [testTagObjectId], testConnection);
      await expect(queryPromise).resolves.not.toThrow();
      await testConnection;
      await expect (queryPromise).resolves.not.toThrow();
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
