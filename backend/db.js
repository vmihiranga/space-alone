const postgres = require('postgres');

const sql = postgres({
  host: 'ep-cool-truth-a1nvfpxx.ap-southeast-1.pg.koyeb.app',
  database: 'koyebdb',
  username: 'koyeb-adm',
  password: 'npg_TZFIqH73wmQa',
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

module.exports = sql;
