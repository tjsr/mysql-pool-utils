import { intEnv, loadEnv, setTestMode } from '@tjsr/simple-env-utils';

import { ConnectionOptions } from 'mysql2/promise';

loadEnv();
setTestMode();

export const connectionDetails: ConnectionOptions = {
  database: 'testdb',
  host: process.env['MYSQL_HOST'] || '127.0.0.1',
  password: process.env['MYSQL_PASSWORD'] || 'testpassword',
  port: intEnv('MYSQL_PORT', 3306),
  user: process.env['MYSQL_USER'] || 'testuser',
} as const;
