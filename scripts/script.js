const { initializationDB } = require('./initializationDB')
const { initializationTables } = require('./initializationTables')

const script = async (dbName) => {
  await initializationDB(dbName)
  await initializationTables()
}

module.exports = { script }
