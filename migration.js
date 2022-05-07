const fs = require('fs')
const path = require('path')
const { Table } = require('./table.js')
module.exports.Migration = async (_sqlConnection, _dir, _executeQuery, _readDir) => {
  const table = Table(_sqlConnection, _executeQuery)
  let batchNumber = 0

  const up = async () => {
    const migrationList = await table.executeRawQuery('SELECT name from migrations')
    const fileList = await _readDir(path.join(_dir, '/migrations/'))
    // console.log('fileList',fileList)
    let count = 0
    const promiseList = []
    const migrationfileList = []
    fileList.forEach(async migrationFile => {
      const tf = migrationList.find(x => x.name === migrationFile)
      if (!tf) {
        count++
        const migrationFilePath = path.join(_dir, '/migrations/', migrationFile)
        const { up: migrationUp } = require(migrationFilePath)
        const tmp = migrationUp(table)
        promiseList.push(tmp)
        migrationfileList.push(migrationFile)
      }
    })
    if (count === 0) {
      return { type: 'warning', message: 'Nothing to migrate\n' }
    } else {
      const paList = await Promise.all(promiseList).then(value => {
        return value
      })
      const insertPromiseList = []
      paList.forEach((pa, index) => {
        if (pa !== false) {
          const insertStatement = `INSERT INTO migrations VALUES(NULL,'${migrationfileList[index]}',${batchNumber},'created')`
          const insertpl = _executeQuery(insertStatement)
          insertPromiseList.push(insertpl)
          console.log('\x1b[32m', migrationfileList[index], '\x1b[36m', ' : migrated successfully ', '\x1b[0m')
        } else {
          console.log('\x1b[31m', migrationfileList[index], '\x1b[31m', ' : Failed to migrate ', '\x1b[0m')
        }
      })
      await Promise.all(insertPromiseList).then(value => {
        return value
      })
      return { type: 'success', message: '\n Migration is done\n' }
    }
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

    const createMigration = table.create('migrations', {
      id: 'int NOT NULL PRIMARY KEY AUTO_INCREMENT',
      name: 'varchar(254) NOT NULL',
      batch: 'int NOT NULL',
      created_at: 'varchar(254) NOT NULL'
    })

    await Promise.all([createMigration]).then(value => {
      return value
    })
    const batchNumberResult = _executeQuery('SELECT IFNULL((SELECT max(batch) FROM migrations),0)  as bathno;')
    batchNumber = await Promise.all([batchNumberResult]).then(value => {
      return value[0][0].bathno
    })
    batchNumber++
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
