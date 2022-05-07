const fs = require('fs')
const path = require('path')
const { Table } = require('./table.js')
module.exports.Migration = async (_sqlConnection, _dir) => {
  const up = async () => {
    const migrationFilePath = path.join(_dir, '/migrations/2-1651905393397-hehahahaha.js')
    const { up: migrationUp } = require(migrationFilePath)
    const xx = await migrationUp(Table(_sqlConnection))
    return xx
  }
  const rollback = async () => {
    const migrationFilePath = path.join(_dir, '/migrations/2-1651905393397-hehahahaha.js')
    const { rollback: migrationDown } = require(migrationFilePath)
    const xx = await migrationDown(Table(_sqlConnection))
    return xx
  }

  const executeQuery = async (_connection, _query) => {
    return new Promise((resolve) => {
      try {
        _connection.query(_query, (err, res) => {
          if (err) {
            resolve(false)
          }
          resolve(res)
        })// end sql command
      } catch (err) {
        // throw err;
        resolve(false)
      }
    }) // end Promise
  } // end getRecordById function

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
          console.log('error', err)
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

    const query = `
    CREATE TABLE IF NOT EXISTS migrations (
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name varchar(254) NOT NULL,
        created_at varchar(254) NOT NULL,
        batch int NOT NULL
        )
    `
    await executeQuery(_sqlConnection, query)

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
        msg = await up()
        responseMessage = { type: 'success', message: msg }
        break
      case 'migration:rollback':
        msg = await rollback()
        responseMessage = { type: 'success', message: msg }
        break
      case 'seeding:create':
      case 'seeding:up':
      case 'seeding:rollback':
        console.log('ok')
        break
      default:
        process.exit()
    }
    return responseMessage
  }
  return init()
}
