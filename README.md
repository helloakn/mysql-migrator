<div id="top"></div> 

# mysql-migrator
npm migration package for mysql, mariadb  

[![Star Count](https://img.shields.io/badge/dynamic/json?color=brightgreen&label=Star&query=stargazers_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fhelloakn%2Fmysql-migrator)](https://github.com/helloakn/mysql-migrator) [![Licence](https://img.shields.io/badge/dynamic/json?color=informational&label=LICENCE&query=license.name&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fhelloakn%2Fmysql-migrator)](https://github.com/helloakn/mysql-migrator) [![Language](https://img.shields.io/badge/dynamic/json?color=blueviolet&label=Language&query=language&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fhelloakn%2Fmysql-migrator)](https://github.com/helloakn/mysql-migrator)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

## Table Of contents
- Installation 
- Setup
  - FOR ES6
  - FOR CommonJs
  - Update package.json
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
#### FOR ES6
```javascript
import { Migrator, Output } from 'mysql-migrator'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbConfig = {
  host: 'localhost',
  user: 'your-user-name',
  port: 3306,
  password: 'your-password',
  database: 'your-database'
}
const migrationsPath = __dirname + '/migrations'
const migrator = new Migrator(dbConfig, migrationsPath)
const result = await migrator.init()
Output(result)
process.exit()

```
#### FOR CommonJs
```javascript
const { Migrator, Output } = require('mysql-migrator')

const dbConfig = {
  host: 'localhost',
  user: 'your-user-name',
  port: 3306,
  password: 'your-password',
  database: 'your-database'
}
const migrationsPath = __dirname + '/migrations'
const migrator = new Migrator(dbConfig, migrationsPath)
const result = await migrator.init()
Output(result)
process.exit()

```
#### Update package.json
```json
...
  "scripts": {
    ...
    "migrate": "node migrator.js"
  },
...
```

<p align="right">(<a href="#top">back to top</a>)</p>


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

<p align="right">(<a href="#top">back to top</a>)</p>


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
	"up": async function(_callBack){
		let query = `INSERT INTO User VALUES(NULL,"AKN","xxxxxx","2/1/22","2/1/22",NULL);`;
		return await new Promise(async (resolve,reject)=>{
			resolve( await _callBack(query));
		}); ;
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

<p align="right">(<a href="#top">back to top</a>)</p>

Thank You for Visiting to my repo. :)
