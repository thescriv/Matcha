const { validator } = require("../lib/validator")

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
      type: "string",
      regex: null,
      message: "api.register nickname is_not_valid",
    },
    {
      element: firstname,
      type: "string",
      regex: null,
      message: "api.register firstname is_not_valid",
    },
    {
      element: lastname,
      type: "string",
      regex: null,
      message: "api.register lastname is_not_valid",
    },
    {
      element: email,
      type: "string",
      regex: /.+@.+\..+/,
      message: "api.register email is_not_valid",
    },
    {
      element: password,
      type: "string",
      regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: "api.register password is_not_valid",
    },
  ]
  validator(validatorRegister)
}

module.exports = { validationRegister }
