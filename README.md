# mysql-pool-utils

A simple wrapper collection of utilities for handling MySQL connections and pools.

Contains:

- `basicMySqlInsert` - From the basic connection executes an insert given the specified fields as a set of parallel arrays.  Very rudimentary checking and safety.
- `getPoolConfig` - Uses a standard set of environment variables to construct a templated config. See below for vars.
- `getConnectionPool` - Grabs the existing or creates a new pool from the config options.
- `safeReleaseConnection` - Releases a connection back to the pool, but doesn't error if the connection is undefined.
- `getConnection` - Grab a connection from the pool.
- `closeConnectionPool` - Closes all connections in the pool, and the pool itself.

## Connection env vars

- `MYSQL_CONNECT_TIMEOUT` (int, default 2000)
- `MYSQL_CONNECTION_POOL_SIZE` (int, default 5)
- `MYSQL_DATABASE` *required*
- `MYSQL_DEBUG` (boolean, default false)
- `MYSQL_HOST` *required*
- `MYSQL_PASSWORD` *required*
- `MYSQL_PORT` (int, default 3306)
- `MYSQL_USER` *required*

## Testing

Before running `npm test`, make sure you have a database with a simple test table accessible at the credentials
specified in `.env.test`.  You can run up a container using `npm db:up` and teardown using `npm db:down`.
