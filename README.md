# mysql-migrator
npm migration package for mysql, mariadb

## Table Of contents
- Installation 
- Setup
- Table Migration
	- create migration 
	- code sample for table migration file
	- run migration file
		- up
		- rollback
- Data Seeding
	- create seeding 
	- code sample for data seeding file
	- run seeding file
		- up
		- rollback

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
## Table Migration
### create migration file
```shell
node migrator.js migration create create_table_user
```
### code sample for table migration file
there are two function **up** and **rollback** functions.
- **up** is for upgrading
- **rollback** is for downgrading. to use this function when you need to roll back to previous batch.
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
node migrator.js migration up
```
#### rollback
```shell
node migrator.js migration rollback
```
## Data Seeding 
### create seeding file
```shell
node migrator.js seeding create user_data_seeding
```
### code sample for data seeding file
there are two function **up** and **rollback** functions.
- **up** is for upgrading
- **rollback** is for downgrading. to use this function when you need to roll back to previous batch.
 ```javascript
//write sql statement to create or modify
module.exports = {
	"up": `
	INSERT INTO User VALUES(NULL,"AKN","xxxxxx","2/1/22","2/1/22",NULL);
	`,
	"rollback":`
	TRUNCATE TABLE User;
	`
}
```
or
 ```javascript
//write sql statement to create or modify
module.exports = {
	"up": function(){
		let query = `INSERT INTO User VALUES(NULL,"AKN","xxxxxx","2/1/22","2/1/22",NULL);`;
		return query;
	},
	"rollback":function(){
		let query = `TRUNCATE TABLE User;`;
		return query;
	}
}
```

### run seeding file
#### up
```shell
node migrator.js seeding up
```
#### rollback
```shell
node migrator.js seeding rollback
```

