const db = require('./db')

const validator = (validationArr) => {
  if (!validationArr.length) {
    throw new Error('validation Array cannot be empty')
  }

  for (const validation of validationArr) {
    const { element, type, regex, message, optional = false } = validation

    let matching = regex && element ? element.match(regex) : true

    if (
      !(
        (!element && optional) ||
        (['string', 'number', 'array'].includes(type) &&
          element &&
          matching &&
          ((type === 'array' && element.length) || typeof element === type))
      )
    ) {
      throw new Error(message)
    }
  }
  return true
}

const validatorQuery = async (validationQuerys) => {
  if (!validationQuerys.length) {
    throw new Error('validationQuerys cannot be empty')
  }

  for (const validation of validationQuerys) {
    const { table, queryOptions, message } = validation

    const res = await db.query(`SELECT id FROM ${table} WHERE ?`, queryOptions)

    if (!res.length) {
      throw new Error(message)
    }
  }

  return true
}

module.exports = { validator, validatorQuery }
