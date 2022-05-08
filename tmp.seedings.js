module.exports = {
  up: async (_query) => {
    const queryString = 'INSERT INTO tblUser VALUES(1,"hello")'
    await _query(queryString)
  },
  rollback: async (_query) => {
    const queryString = 'TRUNCATE TABLE tblUser'
    await _query(queryString)
  }
}