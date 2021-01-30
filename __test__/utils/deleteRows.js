const db = require("../../src/lib/db")

const { tables } = require("../../scripts/configTables")

const deleteRows = async () => {
  await Promise.all([
    ...tables.map((table) => db.query(`DELETE FROM ${table.name}`)),
    ...tables.map((table) =>
      db.query(`ALTER TABLE ${table.name} AUTO_INCREMENT=1`)
    ),
  ])
}

module.exports = { deleteRows }
