module.exports.Table = (_sql, _executeQuery) => {
  const insertData = async (_tblName, _row) => {
    const insertStatement = `INSERT INTO ${_tblName} VALUES(${_row.join(',')})`
    return new Promise(resolve => {
      const result = _executeQuery(insertStatement)
      resolve(result)
    })
  }

  const tableCreate = async (_tblName, _columns) => {
    return new Promise(resolve => {
      const columns = []
      for (const [key, value] of Object.entries(_columns)) {
        columns.push(` ${key} ${value}`)
      }
      const rawQuery = `CREATE TABLE IF NOT EXISTS ${_tblName} ( ${columns.join(',')} )`
      const result = _executeQuery(rawQuery)
      resolve(result)
    })
  }

  const tableDropTable = async (_tblName) => {
    const columnsString = `DROP TABLE IF EXISTS ${_tblName}`
    return new Promise(resolve => {
      const result = _executeQuery(columnsString)
      resolve(result)
    })
  }

  const tblRawQuery = async (_rawQuery) => {
    return new Promise(resolve => {
      const result = _executeQuery(_rawQuery)
      resolve(result)
    })
  }

  return {
    create: tableCreate,
    dropTable: tableDropTable,
    addColumn: tableAddColumn,
    insert: insertData,
    executeRawQuery: tblRawQuery
  }
}
