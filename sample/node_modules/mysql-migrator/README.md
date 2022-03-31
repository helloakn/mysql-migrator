# mysql-migrator
npm migration package for mysql, mariadb

## Table Of contents
- Installation 
- Setup
- create migration 
- code sample for table migration file
- run migration file
-   - up
-   - down

### Installation
```shell
npm install mysql-migrator
```
### Setup
create **migrator.js** with the following code.
```javascript
const {mysqlMigrator} = require('mysql-migrator');

const dbConfig = {
  host: 'your-database-host',
  user: 'your-database-user-name',
  port: 3306,
  password: '******',
  database: 'your-database-name'
}
const migrationsPath = __dirname+"/databases";

mysqlMigrator.init(dbConfig,migrationsPath);
```
### create migration file
```shell
node migrator.js migrate:migration create create_table_customer
```
### code sample for table migration file
there are two function **up** and **down** functions.
- **up** is for upgrading
- **down** is for downgrading. to use this function when you need to roll back to previous batch.
 ```shell
//write sql statement to create or modify
module.exports = {
	"up": `
	CREATE TABLE IF NOT EXISTS User (
		id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
		name varchar(45) NOT NULL,
		password varchar(200) NOT NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		deleted_at datetime DEFAULT NULL
	);
	`,
	"rollback":`
	DROP TABLE IF EXISTS User;
	`
}
```
### run migration file
#### up
```shell
node migrator.js migrate:migration up
```
#### rollback
```shell
node migrator.js migrate:migration rollback
```

