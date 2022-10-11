const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const app = express()


require('dotenv').config({ path: './config.env' })
// app.use(bodyparser.urlencoded({extended: true}))

app.use("/webhook", bodyparser.raw({ type: "*/*" })); 
app.use(express.json())
app.use(cors())

const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users')
const stripeRoute = require('./routes/stripe')

app.use(productRoutes)
app.use(userRoutes)
app.use(stripeRoute)

const connection_string = process.env.CONNECTION_STRING

const port = process.env.PORT || 5000

app.listen(port, console.log(`Server running on port ${port}`))

mongoose.connect(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB Connection established'))
    .catch ((error) => console.log('MongoDB Connection failed: ' + error.message) )