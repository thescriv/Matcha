const mysql = require("mysql2")

const config = require("../../config")

let pool = mysql.createPool(config.DB_CONFIG)

const poolPromise = pool.promise()

const disconnect = () => {
  pool.end()

  console.log("disconnected from mysql")
}

const query = async (query, queryOptions = []) => {
  try {
    return await poolPromise.query(query, queryOptions)
  } catch (err) {
    console.log("an sql error occured.")

    //disconnect()

    throw new Error(err)
  }
}

module.exports = { query, disconnect }
