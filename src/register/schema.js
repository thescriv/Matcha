const { validator } = require('../lib/validator')

function validationRegister({
  nickname,
  firstname,
  lastname,
  email,
  password,
}) {
  const validatorRegister = [
    {
      element: nickname,
      type: 'string',
      regex: null,
      message: 'api.register nickname is_not_valid',
    },
    {
      element: firstname,
      type: 'string',
      regex: null,
      message: 'api.register firstname is_not_valid',
    },
    {
      element: lastname,
      type: 'string',
      regex: null,
      message: 'api.register lastname is_not_valid',
    },
    {
      element: email,
      type: 'string',
      regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
      message: 'api.register email is_not_valid',
    },
    {
      element: password,
      type: 'string',
      regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: 'api.register password is_not_valid',
    },
  ]
  validator(validatorRegister)
}

module.exports = { validationRegister }
