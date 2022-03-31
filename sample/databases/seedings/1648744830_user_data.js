//write sql statement to create or modify
module.exports = {
	"up": function(){
		let query = `INSERT INTO User VALUES(NULL,"AKN","zzz","2/1/22","2/1/22",NULL);`;
		return query;
	},
	"rollback":function(){
		let query = `TRUNCATE TABLE User;`;
		return query;
	}
}