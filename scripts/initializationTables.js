const db = require('../src/lib/db')
const { tables } = require('./configTables')

const initializationTables = async () => {
  const tableChecker = []

  for (const table of tables) {
    try {
      await db.query(
        `CREATE TABLE IF NOT EXISTS ${table.name} ( ${table.columns} )`
      )

      tableChecker.push(`${table.name} OK`)
    } catch (err) {
      tableChecker.push(`${table.name} FAILED [${err.message}]`)
      console.log(tableChecker.join('\n'))
      throw new Error(err.message)
    }
  }

  console.log(tableChecker.join('\n'))
}

module.exports = { initializationTables }
