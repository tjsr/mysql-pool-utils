import * as dotenvFlow from 'dotenv-flow';

import { ConnectionOptions } from 'mysql2/promise';
import { setTestMode } from '@tjsr/simple-env-utils';

dotenvFlow.config({ path: process.cwd(), silent: true });

setTestMode();

export const connectionDetails: ConnectionOptions = {
  database: 'testdb',
  host: '127.0.0.1',
  password: 'testpassword',
  user: 'testuser',
} as const;

