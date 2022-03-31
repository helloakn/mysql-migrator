const {mysqlMigrator} = require('mysql-migrator');

const dbConfig = {
  host: 'localhost',
  user: '',
  port: 3306,
  password: '',
  database: ''
}
const migrationsPath = __dirname+"/db";

mysqlMigrator.init(dbConfig,migrationsPath);
