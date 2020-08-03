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

module.exports = { validator }
