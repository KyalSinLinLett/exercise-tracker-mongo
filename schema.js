const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
    description: String,
    duration: Number,
    date: { type: Date }
})

const userSchema = ({
    username: String,
    log: [logSchema]
})

module.exports = {
    userSchema: userSchema
}