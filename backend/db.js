const postgres = require('postgres');
require('dotenv').config();

const sql = postgres({
  host: process.env.PGHOST || 'ep-cool-truth-a1nvfpxx.ap-southeast-1.pg.koyeb.app',
  database: process.env.PGDATABASE || 'koyebdb',
  username: process.env.PGUSER || 'koyeb-adm',
  password: process.env.PGPASSWORD || 'npg_TZFIqH73wmQa',
  ssl: process.env.PGSSL === 'require' ? 'require' : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

module.exports = sql;
