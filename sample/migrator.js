const {mysqlMigrator} = require('mysql-migrator');

const dbConfig = {
  host: 'localhost',
  user: 'xxxxxx',
  port: 3306,
  password: 'xxxxxx',
  database: 'xxxxxx'
}
const migrationsPath = __dirname+"/databases";

mysqlMigrator.init(dbConfig,migrationsPath);
