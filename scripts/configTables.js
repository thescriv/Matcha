const tables = [
  {
    name: 'user',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'nickname VARCHAR(255) UNIQUE',
      'firstname VARCHAR(255)',
      'lastname VARCHAR(255)',
      'email VARCHAR(255) UNIQUE',
      'password VARCHAR(255)',
      'verified BOOLEAN DEFAULT FALSE',
      'completed BOOLEAN DEFAULT FALSE',
      'bio VARCHAR(255)',
      'gender_id INT',
      'orientation_id INT NOT NULL DEFAULT 1',
      'score INT DEFAULT 100',
    ],
  },
  {
    name: 'gender',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'gender VARCHAR(255) NOT NULL',
    ],
  },
  {
    name: 'register_token',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id INT NOT NULL',
      'token VARCHAR(255) UNIQUE',
      'creation_date BIGINT'
    ],
  },
  {
    name: 'password_reset_token',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id INT NOT NULL',
      'token VARCHAR(255) UNIQUE',
      'creation_date BIGINT'
    ],
  },
  {
    name: 'inactive_token',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'token VARCHAR(255) UNIQUE',
    ],
  },
  {
    name: 'user_visit',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'visitor_id INT NOT NULL',
      'user_id INT NOT NULL',
    ],
  },
  {
    name: 'user_like',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id_1 INT NOT NULL',
      'user_id_2 INT NOT NULL',
    ],
  },
  {
    name: 'user_blocked',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id_1 INT NOT NULL',
      'user_id_2 INT NOT NULL',
    ],
  },
  {
    name: 'user_match',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id_1 INT NOT NULL',
      'user_id_2 INT NOT NULL',
    ],
  },
  {
    name: 'tags',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'tag VARCHAR(255) NOT NULL',
    ],
  },
  {
    name: 'tags_to_user',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id INT NOT NULL',
      'tag_id INT NOT NULL',
    ],
  },
  {
    name: 'user_flaged',
    columns: [
      'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'user_id INT NOT NULL UNIQUE',
      'flag_count INT'
    ]
  }
]

module.exports = { tables }
