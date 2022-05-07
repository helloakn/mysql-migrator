/*
CREATE TABLE IF NOT EXISTS migrations (
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name varchar(254) NOT NULL,
        created_at varchar(254) NOT NULL,
        batch int NOT NULL
        )
*/

module.exports.Table = (_sql) => {
  const executeQuery = async (_query) => {
    return new Promise((resolve) => {
      try {
        _sql.query(_query, (err, res) => {
          if (err) {
            resolve(false)
          }
          resolve(res)
        })
      } catch (err) {
        resolve(false)
      }
    })
  }

  const tableCreate = async (_tblName, _columns) => {
    const columns = []
    for (const [key, value] of Object.entries(_columns)) {
      columns.push(` ${key} ${value}`)
    }
    const columnsString = `CREATE TABLE IF NOT EXISTS ${_tblName} ( ${columns.join(',')} )`
    return await executeQuery(columnsString)
  }

  const tableDropTable = (_tblName) => {
    return { tableName: _tblName }
  }

  const tableAddColumn = () => {

  }
  return {
    create: tableCreate,
    dropTable: tableDropTable,
    addColumn: tableAddColumn
  }
}
