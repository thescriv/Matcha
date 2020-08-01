const db = require('../../src/lib/db')

const { tables } = require('../../scripts/configTables')

const deleteRows = async () => {
  for (table of tables) {
    await db.query(`DELETE FROM ${table.name}`)
    await db.query(`ALTER TABLE ${table.name} AUTO_INCREMENT = 1`)
  }
}

module.exports = { deleteRows }
