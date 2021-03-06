const fs = require('fs')
const mysql = require('mysql')
const { Migration } = require('./migrator.migrations.js')
const { Seeding } = require('./migrator.seedings.js')
const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m'
}

const Output = (_msg) => {
  switch (_msg.type) {
    case 'error':
      console.log(colors.FgRed, _msg.message, colors.Reset)
      break
    case 'warning':
      console.log(colors.FgYellow, _msg.message, colors.Reset)
      break
    case 'success':
      console.log(colors.FgGreen, _msg.message, colors.Reset)
      break
    default:
      console.log(colors.FgBlack, _msg.message, colors.Reset)
      break
  }
}

const readDir = async (_dir) => {
  return new Promise(resolve => {
    fs.readdir(_dir, (err, files) => {
      if (err) {
        console.log(err)
        process.exit()
      }
      resolve(files)
    })
  })
}

class Migrator {
  constructor (_config, _dbPath) {
    this.dbConfig = _config
    this.dbPath = _dbPath
  }

  connect = async () => {
    return new Promise(resolve => {
      const dbConn = mysql.createConnection(this.dbConfig)
      dbConn.connect(error => {
        if (error) {
          throw error
        } else {
          resolve(dbConn)
        }
        console.log(colors.FgCyan, '  Successfully Connected to Database', colors.Reset)
      })
    })
  }

  executeQuery = async (_query) => {
    return new Promise((resolve) => {
      try {
        this.dbConnection.query(_query, (err, res) => {
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

  init = async () => {
    const simpleCommand = `
  \x1b[31m you are missing something. pls do as the following example \x1b[33m

    \x1b[36m.:: For Table Migration ::.\x1b[33m
    \u2605 npm run migrate migration:create tablename
    \u2605 npm run migrate migration:up
    \u2605 npm run migrate migration:rollback 

    \x1b[36m.:: For Data Seeders ::.\x1b[33m
    \u2605 npm run migrate seeding:create seedingfile
    \u2605 npm run migrate seeding:up
    \u2605 npm run migrate seeding:rollback
    `
    this.dbConnection = await this.connect()
    this.createDirs()

    if (process.argv.length > 2) {
      const caseStr = process.argv[2]
      switch (caseStr) {
        case 'migration:create':
        case 'migration:up':
        case 'migration:rollback':
        case 'migration:reset':
          return await Migration(this.dbConnection, this.dbPath, this.executeQuery, readDir)
        case 'seeding:create':
        case 'seeding:up':
        case 'seeding:rollback':
          return await Seeding(this.dbConnection, this.dbPath, this.executeQuery, readDir)
        default:
          // check utf8 code herere -> https://www.w3schools.com/charsets/ref_utf_symbols.asp
          return { type: 'warning', message: simpleCommand }
      }
    } else {
      return { type: 'error', message: 'there is nothing to do' }
    }
  }

  createDirs = () => {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath)
    }
    if (!fs.existsSync(this.dbPath + '/migrations')) {
      fs.mkdirSync(this.dbPath + '/migrations')
    }
    if (!fs.existsSync(this.dbPath + '/seedings')) {
      fs.mkdirSync(this.dbPath + '/seedings')
    }
  }
}

exports.colors = colors
exports.Migrator = Migrator
exports.Output = Output
