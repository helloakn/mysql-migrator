module.exports.Table = (_sql, _executeQuery) => {
  const insertData = async (_tblName, _row) => {
  }

  const tableCreate = async (_tblName, _columns) => {
    // console.log('tablecreate')
    return new Promise(async resolve => {
      const columns = []
      for (const [key, value] of Object.entries(_columns)) {
        columns.push(` ${key} ${value}`)
      }
      const rawQuery = `CREATE TABLE IF NOT EXISTS ${_tblName} ( ${columns.join(',')} )`
      console.log('rawQuery',rawQuery)
      const result = await _executeQuery(rawQuery)
      console.log('result',result)
      resolve(
        result === false
        ? 'wrong'
        : 'success'
        )
    })
    
  }

  const tableDropTable = async (_tblName) => {
    const columnsString = `DROP TABLE IF EXISTS ${_tblName}`
    return await _executeQuery(columnsString)
  }

  const tableAddColumn = () => {

  }

  return {
    create: tableCreate,
    dropTable: tableDropTable,
    addColumn: tableAddColumn,
    insert: insertData,
    executeRawQuery: _executeQuery
  }
}
