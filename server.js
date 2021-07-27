const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  count: {
    type: Number
  },

  log: [{
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    date: {
      type: Date
    }
  }]
})

const User = mongoose.model('User', userSchema)

app.post('/api/users', (req, res) => {
  const user = new User({ username: req.body.username })

  user.save((err, user) => {
    if (err) return console.log(err)

    return res.json({ _id: user._id, username: user.username })
  })
})

app.get('/api/users', (req, res) => {
  User.find({}, { log: 0 }, (err, users) => {
    if (err) return console.log(err)

    console.log(users)
    return res.json(users)
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description: desc, ':_id': userId, duration: dura, date: date } = req.body

  const payload = {
    date: date == '' ?  new Date().toDateString() : date,
    duration: parseInt(dura),
    description: desc
  }

  console.log(payload)

  User.findByIdAndUpdate(
    userId, 
    { $push : { log: payload } }, 
    { new: true },
    (err, data) => {
      if (err) return console.log(err)

      if (data == null) return res.send("unknown _id")

      return res.json(Object.assign({ _id: data._id, username: data.username }, payload))
    } 
  )
})

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id

  User.findById(userId, (err, data) => {
    if (err) return console.log(err)

    var logs = data.log.map((log) => ({ description: log.description, duration: log.duration, date: log.date }))

    console.log(logs)

    return res.json(Object.assign({_id: data._id, username: data.username, count: logs.length, log: logs}))
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
