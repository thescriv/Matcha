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
    await poolPromise.query("USE matchaTest")
    return await poolPromise.query(query, queryOptions)
  } catch (err) {
    console.error(err)
  }

  return

  /*   new Promise((resolve, reject) => {
    pool.query(query, queryOptions, (err, rows) => {
      if (err) {
        console.log(err?.sqlMessage || 'an sql error occured')
        reject(err)
      } else {
        resolve(rows)
      }
    })
  }) */
}

module.exports = { query, disconnect }
