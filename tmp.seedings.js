module.exports = {
  up: async (_query) => {
    const queryString = 'SHOW databases'
    await _query(queryString)
  },
  rollback: async (_query) => {
    const queryString = 'SHOW databases'
    await _query(queryString)
  }
}
