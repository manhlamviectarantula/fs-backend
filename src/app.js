const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerSetup = require('../swagger.js'); 

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGIN.split(",");
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/src/uploads', express.static('src/uploads'))
swaggerSetup(app);

require('dotenv').config()

require('./dbs/mongodb')
require('./dbs/redis')

app.use('/', require('./routes/index.js'))

module.exports = app 