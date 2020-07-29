const { validator } = require('../lib/validator')

const validationLogin = ({nickname, password}) => {
  const validatorLogin = [
    {
      element: nickname,
      type: 'string',
      regex: null,
      message: 'api.login nickname is_not_valid',
    },
    (validatorPassword = {
      element: password,
      type: 'string',
      regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: 'api.login password is_not_valid',
    }),
  ]

  validator(validatorLogin)
}

module.exports = { validationLogin }
