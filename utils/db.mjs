// Create PostgreSQL Connection Pool here !

import * as pg from "pg";
const { Pool } = pg.default;
import "dotenv/config";

const connectionPool = new Pool({
  connectionString: `postgresql://${process.env.USER_NAME}:${process.env.PASSWORD}@localhost:5432/${process.env.DB_NAME}`,
});

export default connectionPool;
