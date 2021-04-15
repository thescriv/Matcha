const db = require("../src/lib/db")

const initializationDB = async (dbName) => {
  try {
    await db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    
    await db.query(`USE ${dbName}`)

    console.log(`CONNECTED TO ${dbName}`)
  } catch (err) {
    console.log(`CONNECTION FAILED TO ${dbName}`)
    throw new Error(err)
  }
}

module.exports = { initializationDB }
