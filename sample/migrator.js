const {mysqlMigrator} = require('mysql-migrator');

const dbConfig = {
  host: 'localhost',
  user: 'haha',
  port: 3306,
  password: 'aknakn0091',
  database: 'ShweMart'
}
const migrationsPath = __dirname+"/databases";

mysqlMigrator.init(dbConfig,migrationsPath);
