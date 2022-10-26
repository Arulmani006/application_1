
require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors= require('cors');
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose')
const { logEvents, logger } = require('./middleware/logger')
console.log(process.env.NODE_ENV)

const PORT = process.env.PORT || 3000

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root.js')); //index page
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/noteRoutes'))


app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, "views", '404.html'))
    }else if(req.accepts('json')) {
        res.json({message : "404 not found"})
    }else {
        res.type('txt').send('404 not found');
    }
})

app.use(errorHandler);
mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => console.log(`server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err, 'err')
    logEvents(`${err.on}: ${err.code}\t${err.syscall}\t{err.hostname}`,
    'MongoErrorLog.log')    
})
