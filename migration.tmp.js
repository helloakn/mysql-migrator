module.exports = {
  up: async (_sql) => {
    console.log('up')
  },
  rollback: async (_sql) => {
    console.log('rollback')
  }
}
