
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10)
exports.hashedPassword = (password) => bcrypt.hashSync(password, salt)
exports.comparePassword = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);

