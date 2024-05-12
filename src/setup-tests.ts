import * as dotenvFlow from 'dotenv-flow';

import { intEnv, setTestMode } from '@tjsr/simple-env-utils';

import { ConnectionOptions } from 'mysql2/promise';

// import { verifyDatabaseReady } from './verifyDatabaseReady';

dotenvFlow.config({ path: process.cwd(), silent: true });

setTestMode();

export const connectionDetails: ConnectionOptions = {
  database: 'testdb',
  host: process.env['MYSQL_HOST'] || '127.0.0.1',
  password: process.env['MYSQL_PASSWORD'] || 'testpassword',
  port: intEnv('MYSQL_PORT', 3306),
  user: process.env['MYSQL_USER'] || 'testuser',
} as const;

// const test = async () => {

// };

// await test();

// await verifyDatabaseReady(connectionDetails);