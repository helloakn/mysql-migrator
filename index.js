var fs = require('fs');

const mysql = require("mysql");
const { resolve } = require('path');
const { exit } = require('process');

// Create a connection to the database
const _dbConfig = {
    host: DatabaseConfig.HOST,
    user: DatabaseConfig.USER,
    port: DatabaseConfig.PORT,
    password: DatabaseConfig.PASSWORD,
    database: DatabaseConfig.DB_NAME
};

const migration = {
    create : async (_dir,_fileName)=>{
        //sample -> create('database/migrations','create_table_customer')
        if (!fs.existsSync(_dir)){
            fs.mkdirSync(_dir);
        }
        let tmpFile = (_dir + "/" + (Date.now() / 1000 | 0) +"_"+ _fileName + '.js').replace('//','/');
        return new Promise(resolve => {
            fs.writeFile(
                tmpFile, 
                "//write sql statement to create or modify\nmodule.exports = {\n\t\"up\": \"\",\n\t\"down\":\"\"\n}", 
                function (err) {
                    if (err) {
                        throw err;
                        resolve(error);
                    }
                    else{
                        resolve('File is created successfully.');
                    }
                    
                }
            );
        });
    },
    up : async (_dir,_callBack)=>{

        let cmdString = `
        CREATE TABLE IF NOT EXISTS migrations (
            id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
            name varchar(254) NOT NULL,
            created_at varchar(254) NOT NULL,
            batch int NOT NULL
            )
        `;

        let status = await _callBack(cmdString);

        _dir = (_dir + "/").replace("//","/");

        let readDir = await new Promise((resolve) => {
            fs.readdir(_dir, (err, files) => {
                if(err){
                    resolve(err);
                }
                else{
                    const pattern = /\.(js|mjs|mjs|cjs|tsx)$/i;
                    files = files.filter(
                        x=>x.match(pattern)
                        )
                        .map(
                            x=>x.replace(pattern,"")
                        );
                    resolve(files);
                }
            });
        });

        let batchNo = 1;
        let dump = await new Promise(async (resolve, reject) =>{
            let queryBath = `SELECT IFNULL(max(batch),0) as bathNo FROM migrations`;
            let resBath = await _callBack(queryBath);
            batchNo += resBath[0].bathNo;
            let checkResults = readDir.map(async x=>{
                //
                
                console.log('resBath',batchNo);
                let queryString = `SELECT * FROM migrations where name='${x}'`;
                let res = await _callBack(queryString);
                console.log('res',res)
                if(res == false){
                    let filePath = "../"+_dir+x+".js";
                    let jsonObj = require(filePath);
                    //console.logjsonObj.up();
                    try{
                        let upResult = await _callBack(jsonObj.up);
                        console.log('upResult',upResult);
                        if(!upResult){
                            console.error("please check ur up function in file "+filePath );
                        }
                        else{
                            let queryInsert = `INSERT INTO migrations VALUES(NULL,'${x}','${Date.now()}',${batchNo})`;
                            console.log('queryInsert',queryInsert);
                            let resInsert = await _callBack(queryInsert);
                            console.log('resInsert',resInsert);
                        }
                        return upResult;
                    }
                    catch(err){
                        throw err;
                        return err;
                    }
                    
                }
                return res; 


            })
            resolve(checkResults);
        });
            
        return await Promise.all(dump).then(value=>{return value;});
    }

}

class Database{
    constructor(){

    }
    /*
    migrate:migration create tablename
    migrate:migration up
    migrate:migration down
    migrate:migration refresh
    migrate:migration reset
    migrate:seeder create seeder
    migrate:seeder up
    migrate:seeder down
    */
    executeQuery = async (_query,dbConnection=this.dbConnection) => {
        console.log('=>',_query);
        return new Promise((resolve,reject) => {
            console.log('---');
            
            try{
                dbConnection.query(_query, (err, res) => {
                    
                  if (err) {
                      resolve(false);
                      return;
                  }
                  resolve(res);
                });// end sql command
            }
            catch(err){
               // throw err;
                resolve(false)
            }
            

          });// end Promise
    }//end getRecordById function

    init= async (_dbPath="./database")=>{
        this.dbConfig = _dbConfig;
        this.dbConnection = await this.connect();

        if (!fs.existsSync(_dbPath)){
            fs.mkdirSync(_dbPath);
        }
        if(process.argv.length>2){
           switch(process.argv[2]){
            case "migrate:migration":
                if(process.argv.length>3){
                    switch(process.argv[3]){
                        case "create" :
                            if(process.argv.length>4){
                                let response = await migration.create(_dbPath+"/migrations",process.argv[4]); 
                                console.log(response);
                               
                            }
                        break;

                        case "up" :
                            let response = await migration.up(_dbPath+"/migrations",this.executeQuery);
                            console.log('response',response);
                            process.exit();
                           
                        break;
                    }
                }
                break;
            default :
                console.log('sorry');
            break;
           }
        }
     //   process.exit();
    } // end init

    connect=async ()=>{
        return new Promise(resolve => {
            let dbConn = mysql.createConnection(this.dbConfig);

            dbConn.connect(error => {
                if (error)
                {
                    throw error;
                    return 0;
                }
                else{
                    resolve(dbConn);
                }
                console.log("Successfully connected to the database.");
            });

          //  return dbConn;
        });
    }

}


exports.mysqlMigrator = new Database();