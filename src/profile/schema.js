const { validator } = require('../lib/validator')

const validationUpdateProfile = ({
  firstname,
  lastname,
  email,
  password,
  bio,
  gender,
  orientation,
  tagIds,
}) => {
  const validatorUpdateProfile = [
    {
      element: firstname,
      type: 'string',
      regex: null,
      message: 'api.updateProfile firstname is_not_valid',
      optional: true,
    },
    {
      element: lastname,
      type: 'string',
      regex: null,
      message: 'api.updateProfile lastname is_not_valid',
      optional: true,
    },
    {
      element: email,
      type: 'string',
      regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
      message: 'api.updateProfile email is_not_valid',
      optional: true,
    },
    {
      element: password,
      type: 'string',
      regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: 'api.updateProfile password is_not_valid',
      optional: true,
    },
    {
      element: bio,
      type: 'string',
      regex: null,
      message: 'api.completeProfile bio is_not_valid',
      optional: true,
    },
    {
      element: gender,
      type: Number,
      regex: null,
      message: 'api.completeProfile gender is_not_valid',
      optional: true,
    },
    {
      element: orientation,
      type: Number,
      regex: null,
      message: 'api.completeProfile orientation is_not_valid',
      optional: true,
    },
    {
      element: tagIds,
      type: Array,
      regex: null,
      message: 'api.completeProfile tagsId is_not_valid',
      optional: true,
    },
  ]

  validator(validatorUpdateProfile)
}

module.exports = { validationUpdateProfile }
