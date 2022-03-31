const {mysqlMigrator} = require('mysql-migrator');

const dbConfig = {
  host: 'localhost',
  user: 'xxx',
  port: 3306,
  password: 'xxx',
  database: 'xxx'
}
const migrationsPath = __dirname+"/zz";

mysqlMigrator.init(dbConfig,migrationsPath);
