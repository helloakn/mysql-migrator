const fs = require('fs')
const path = require('path')
const { Table } = require('./table.js')
module.exports.Migration = async (_sqlConnection, _dir, _executeQuery, _readDir) => {
  const table = Table(_sqlConnection, _executeQuery)

  const up = async () => {
    const migrationList = await table.executeRawQuery('SELECT name from migrations')
    const fileList = await _readDir(path.join(_dir, '/migrations/'))
    console.log('fileList',fileList)
    let count = 0
    let promiseList = []
    fileList.forEach(async migrationFile => {
      const tf = migrationList.find(x => x.name === migrationFile)
      console.log('tf yyyyy',tf)
      if (!tf) {
        count++
        console.log('!tf')
        const migrationFilePath = path.join(_dir, '/migrations/', migrationFile)
        const { up: migrationUp } = require(migrationFilePath)
        //const xx = new Promise(resolve => {
        let tmp = migrationUp(table)
        promiseList.push(tmp)
         // resolve(migres)
       // })
      }

    })
    if (count === 0) {
      return { type: 'warning', message: 'Nothing to migrate' }
    } else {
      console.log('count xxxxx',count)
      console.log('promiseList',promiseList)
      let pa = await Promise.all(promiseList).then(value=>{
        console.log('promisessall value')
        return value
      })
      console.log('pa',pa)
      return { type: 'success', message: '\n Successfully migrated.' }
    }
    // const migrationFilePath = path.join(_dir, '/migrations/2-1651905393397-hehahahaha.js')
    // const { up: migrationUp } = require(migrationFilePath)
    // const xx = await migrationUp(table)
    // return xx
  }

  const rollback = async () => {
    const migrationFilePath = path.join(_dir, '/migrations/2-1651905393397-hehahahaha.js')
    const { rollback: migrationDown } = require(migrationFilePath)
    const xx = await migrationDown(table)
    return xx
  }

  const createFile = async (_filename) => {
    const fileCount = await new Promise(resolve => {
      const migDir = path.join(_dir, '/migrations/')
      fs.readdir(migDir, (err, files) => {
        if (err) {
          resolve(0)
        } else {
          resolve(files.length)
        }
      })
    })
    _filename = _dir + '/migrations/' + (fileCount + 1) + '-' + (new Date()).getTime().toString() + '-' + _filename + '.js'
    const returnMsg = await new Promise(resolve => {
      const tmpFile = path.join(__dirname, '/migration.tmp.js')
      fs.copyFile(tmpFile, _filename, (err) => {
        if (err) {
          // console.log('error', err)
          resolve(err)
        } else {
          resolve('success')
        }
      })
    })

    return returnMsg === 'success'
      ? { type: 'success', message: 'Successfully created' }
      : { type: 'error', message: 'failed to create, pls check your directories.' }
  }

  const init = async () => {
    let msg
    let responseMessage

    await table.create('migrations', {
      id: 'int NOT NULL PRIMARY KEY AUTO_INCREMENT',
      name: 'varchar(254) NOT NULL',
      batch: 'int NOT NULL',
      created_at: 'varchar(254) NOT NULL'
    })

    const caseStr = process.argv[2]
    switch (caseStr) {
      case 'migration:create':
        if (process.argv.length !== 4) {
          return { type: 'error', message: 'please describe table name. example -> npm run migrate migration:create tablename' }
        } else {
          msg = await createFile(process.argv[3])
          responseMessage = msg
          break
        }
      case 'migration:up':
        responseMessage = await up()
        break
      case 'migration:rollback':
        msg = await rollback()
        responseMessage = { type: 'success', message: msg }
        break
      case 'seeding:create':
      case 'seeding:up':
      case 'seeding:rollback':
        console.log('seeding')
        break
      default:
        process.exit()
    }
    return responseMessage
  }
  return init()
}
