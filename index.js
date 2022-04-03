const { log } = require('console');
var fs = require('fs');

const mysql = require("mysql");
const { exit } = require('process');

const colors ={
    "Reset" : "\x1b[0m",
    "Bright" : "\x1b[1m",
    "Dim" : "\x1b[2m",
    "Underscore" : "\x1b[4m",
    "Blink" : "\x1b[5m",
    "Reverse" : "\x1b[7m",
    "Hidden" : "\x1b[8m",

    "FgBlack" : "\x1b[30m",
    "FgRed" : "\x1b[31m",
    "FgGreen" : "\x1b[32m",
    "FgYellow" : "\x1b[33m",
    "FgBlue" : "\x1b[34m",
    "FgMagenta" : "\x1b[35m",
    "FgCyan" : "\x1b[36m",
    "FgWhite" : "\x1b[37m",

    "BgBlack" : "\x1b[40m",
    "BgRed" : "\x1b[41m",
    "BgGreen" : "\x1b[42m",
    "BgYellow" : "\x1b[43m",
    "BgBlue" : "\x1b[44m",
    "BgMagenta" : "\x1b[45m",
    "BgCyan" : "\x1b[46m",
    "BgWhite" : "\x1b[47m"
}

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
                "//write sql statement to create or modify\nmodule.exports = {\n\t\"up\": \"\",\n\t\"rollback\":\"\"\n}", 
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
       // console.log ('_dir',_dir);
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

       //console.log('readDir',readDir);
        let batchNo = 1;
        let dump = await new Promise(async (resolve, reject) =>{
            let queryBath = `SELECT IFNULL(max(batch),0) as bathNo FROM migrations`;
            let resBath = await _callBack(queryBath);
            batchNo += resBath[0].bathNo;
            let checkResults = readDir.map(async x=>{
                //
                
                let queryString = `SELECT * FROM migrations where name='${x}'`;
                let res = await _callBack(queryString);
                if(res == false){
                    let filePath = `${_dir}${x}.js`;
                    //console.log('filePath',filePath);
                    let jsonObj = require(filePath.replace(' ',''));
                    //console.log(jsonObj.up);
                    try{
                        let upResult = await _callBack(jsonObj.up);
                        if(!upResult){
                            console.error("please check ur up function in file "+filePath );
                        }
                        else{
                            let queryInsert = `INSERT INTO migrations VALUES(NULL,'${x}','${Date.now()}',${batchNo})`;
                           // console.log('queryInsert',queryInsert);
                            let resInsert = await _callBack(queryInsert);
                            console.log(colors.FgGreen,"UP Function : " + x);
                           // console.log('resInsert',resInsert);
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
    },
    rollback : async (_dir,_callBack)=>{
        let dump = await new Promise(async (resolve, reject) =>{
            console.log(colors.FgMagenta,"I'm running rollback functions.");
            let queryString = `SELECT * FROM migrations WHERE batch=(SELECT max(batch) FROM migrations)`;
            let res = await _callBack(queryString);
            if(res.length==0){ 
                console.log(colors.FgYellow,"There is nothing to rollback");
                resolve('there is nothing to rollback');
            }
            console.log(colors.FgBlue,`Running on Batch : ${res[0].batch}`);
            let tmpResult = res.map(async (x)=>{
                
                let filePath = (_dir + "/" + x.name +".js").replace("//","/");
                
                try{
                    let jsonObj = require(filePath);
                    let resRollBack = await _callBack(jsonObj.rollback);
                    resRollBack = await _callBack(`DELETE FROM migrations WHERE id=${x.id}`);
                    console.log(colors.FgGreen,`Successfully RollBack`,colors.FgYellow,` :  ${x.name}.js`);
                    return "finished";
                }
                catch(err){
                    console.log(colors.FgRed,`Please check your rollback function on ${x.name}.js`);
                    throw err;
                    return(err);
                }
                
            });
            resolve(tmpResult);
        });
        return await Promise.all(dump).then(value=>{return value;});
    }

}
const seeding = {
    create : async (_dir,_fileName)=>{
        //sample -> create('db/seeding','create_table_customer')
        if (!fs.existsSync(_dir)){
            fs.mkdirSync(_dir);
        }
        let tmpFile = (_dir + "/" + (Date.now() / 1000 | 0) +"_"+ _fileName + '.js').replace('//','/');
        return new Promise(resolve => {
            fs.writeFile(
                tmpFile, 
                "//write sql statement to create or modify\nmodule.exports = {\n\t\"up\": \"\",\n\t\"rollback\":\"\"\n}", 
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
        CREATE TABLE IF NOT EXISTS seedings (
            id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
            name varchar(254) NOT NULL,
            created_at varchar(254) NOT NULL,
            batch int NOT NULL
            )
        `;

        let status = await _callBack(cmdString);

        _dir = (_dir + "/").replace("//","/");
       // console.log ('_dir',_dir);
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

       //console.log('readDir',readDir);
        let batchNo = 1;
        let dump = await new Promise(async (resolve, reject) =>{
            let queryBath = `SELECT IFNULL(max(batch),0) as bathNo FROM seedings`;
            let resBath = await _callBack(queryBath);
            batchNo += resBath[0].bathNo;
            let checkResults = readDir.map(async x=>{
                //
                
                let queryString = `SELECT * FROM seedings where name='${x}'`;
                let res = await _callBack(queryString);
                if(res == false){
                    let filePath = `${_dir}${x}.js`;
                    //console.log('filePath',filePath);
                    let jsonObj = require(filePath.replace(' ',''));
                    //console.log(jsonObj.up);
                    try{
                        let upResult = null;
                        if(jsonObj.up instanceof Function){
                            //upResult = await _callBack(jsonObj.up());
                            //upResult = await jsonObj.up(await _callBack );
                            upResult = await new Promise(async (tmpResolve)=>{
                                tmpResolve(await jsonObj.up(await _callBack ));
                            });
                        }
                        else{
                            upResult = await _callBack(jsonObj.up);
                        }
                        //let upResult = await _callBack(jsonObj.up);
                       

                        if(!upResult){
                            console.error("please check ur up function in file "+filePath );
                        }
                        else{
                            let queryInsert = `INSERT INTO seedings VALUES(NULL,'${x}','${Date.now()}',${batchNo})`;
                           // console.log('queryInsert',queryInsert);
                            let resInsert = await _callBack(queryInsert);
                            console.log(colors.FgGreen,"UP Function : " + x);
                           // console.log('resInsert',resInsert);
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
            
            resolve(await Promise.all(checkResults).then(value=>{return value;}));
        });
            
        return await Promise.all(dump).then(value=>{return value;});
    },
    rollback : async (_dir,_callBack)=>{
        let dump = await new Promise(async (resolve, reject) =>{
            console.log(colors.FgMagenta,"I'm running rollback functions.");
            let queryString = `SELECT * FROM seedings WHERE batch=(SELECT max(batch) FROM seedings)`;
            let res = await _callBack(queryString);
            if(res.length==0){ 
                console.log(colors.FgYellow,"There is nothing to rollback");
                resolve('there is nothing to rollback');
            }
            console.log(colors.FgBlue,`Running on Batch : ${res[0].batch}`);
            let tmpResult = res.map(async (x)=>{
                
                let filePath = (_dir + "/" + x.name +".js").replace("//","/");
                
                try{
                    let jsonObj = require(filePath);
                    if(jsonObj.up instanceof Function){
                    
                    }
                    let resRollBack = await _callBack((jsonObj.rollback instanceof Function)?jsonObj.rollback():jsonObj.rollback);
                    //let resRollBack = await _callBack(jsonObj.rollback);
                    resRollBack = await _callBack(`DELETE FROM seedings WHERE id=${x.id}`);
                    console.log(colors.FgGreen,`Successfully RollBack`,colors.FgYellow,` :  ${x.name}.js`);
                    return "finished";
                }
                catch(err){
                    console.log(colors.FgRed,`Please check your rollback function on ${x.name}.js`);
                    throw err;
                    return(err);
                }
                
            });
            resolve(tmpResult);
        });
        return await Promise.all(dump).then(value=>{return value;});
    }

}

class MySqlMigrator{
    constructor(){

    }
    /*
    migration create tablename
    migration up
    migration rollback
    migration refresh
    migration reset
    seeder create seeder
    seeder up
    seeder rollback
    */
    executeQuery = async (_query,dbConnection=this.dbConnection) => {
        return new Promise((resolve,reject) => {
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

    init= async (_dbConfig,_dbPath="./database")=>{
        this.dbConfig = _dbConfig;
        this.dbConnection = await this.connect();
        
        if (!fs.existsSync(_dbPath)){
            fs.mkdirSync(_dbPath);
        }
        if (!fs.existsSync(_dbPath+'/migrations')){
            fs.mkdirSync(_dbPath+'/migrations');
        }
        if (!fs.existsSync(_dbPath+'/seedings')){
            fs.mkdirSync(_dbPath+'/seedings');
        }
        let response = null;
        if(process.argv.length>2){
           switch(process.argv[2]){
            case "migration":
                if(process.argv.length>3){
                    switch(process.argv[3]){
                        case "create" :
                            if(process.argv.length>4){
                                response = await migration.create(_dbPath+"/migrations",process.argv[4]); 
                                process.exit();
                            }
                        break;

                        case "up" :
                            response = await migration.up(_dbPath+"/migrations",this.executeQuery);
                            process.exit();
                        break;

                        case "rollback" :
                            response = await migration.rollback(_dbPath+"/migrations",this.executeQuery);
                            process.exit();
                           
                        break;
                    }
                }
                break;
            case "seeding":
                if(process.argv.length>3){
                    switch(process.argv[3]){
                        case "create" :
                            if(process.argv.length>4){
                                response = await seeding.create(_dbPath+"/seedings",process.argv[4]); 
                                process.exit();
                            }
                        break;

                        case "up" :
                            response = await seeding.up(_dbPath+"/seedings",this.executeQuery);
                            process.exit();
                        break;

                        case "rollback" :
                            response = await seeding.rollback(_dbPath+"/seedings",this.executeQuery);
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


exports.mysqlMigrator = new MySqlMigrator();