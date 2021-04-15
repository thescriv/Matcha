const db = require("../src/lib/db")
const { tables } = require("./configTables")

const initializationTables = async () => {
  /* const initTable = async (table) => {
    try {
      await db.query(
        `CREATE TABLE IF NOT EXISTS ${table.name} ( ${table.columns} )`
      )
      
    } catch (err) {
      throw new Error(`an error occured ${err?.message || err}: ${table.name} FAILED`)
    }
  } */

  for (const table of tables) {
    try {
      await db.query(
        `CREATE TABLE IF NOT EXISTS ${table.name} ( ${table.columns} )`
      )
      
    } catch (err) {
      throw new Error(`an error occured ${err?.message || err}: ${table.name} FAILED`)
    }
  }

  //await Promise.all(tables.map((table) => initTable(table)))

  console.log(`All tables were created with no problem !`)
}

module.exports = { initializationTables }
