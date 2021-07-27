const userSchema = require('./schema')
const mongoose = require('mongoose')

const User = mongoose.model("User", userSchema.userSchema)

module.exports = {
    User: User
}