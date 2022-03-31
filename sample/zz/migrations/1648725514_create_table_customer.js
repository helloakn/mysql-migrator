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