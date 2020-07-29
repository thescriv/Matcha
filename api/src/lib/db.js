const mysql = require('mysql')

const config = require('../../../../config')

let pool = mysql.createPool(config.DB_CONFIG)

const disconnect = () => {
  pool.end()

  console.log('disconnected from mysql')
}

const query = (query, queryOptions = []) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((_err, connection) => {
      connection.query(query, queryOptions, (err, rows) => {
        connection.release()
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  })
}

module.exports = { query, disconnect }
