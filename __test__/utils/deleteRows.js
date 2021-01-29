const db = require("../../src/lib/db")

const { tables } = require("../../scripts/configTables")

const deleteRows = async () => {
  await Promise.all(
    tables.map((table) => db.query(`DELETE FROM ${table.name}`))
  )
}

module.exports = { deleteRows }
