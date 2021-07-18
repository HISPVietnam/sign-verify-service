const Bcrypt = require("bcrypt");

const hashPassword = (pw) => {
  return Bcrypt.hashSync(pw, Bcrypt.genSaltSync(10));
};

const authenticate = (username, password) => {
  // for now we just check that username==password
  const userPassword = hashPassword(username);

  return {
    isValid: Bcrypt.compareSync(password, userPassword),
    valid: Bcrypt.compareSync(password, userPassword),
    credentials: { username, password },
  };
};

module.exports = { hashPassword, authenticate };
