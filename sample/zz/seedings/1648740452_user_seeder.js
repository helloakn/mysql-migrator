//write sql statement to create or modify
module.exports = {
	"up": `
	INSERT INTO User VALUES(NULL,"AKN","xxxxxx","2/1/22","2/1/22",NULL);
	`,
	"rollback":`
	TRUNCATE TABLE User;
	`
}