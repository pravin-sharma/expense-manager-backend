const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorHandler = require('./util/Error/errorHandler');

//middleware
app.use(express.json());
app.use(cookieParser());


//Import Routes
const userRoute = require('./routes/userRoute');

//Routes
app.use('/api/v1', userRoute);
app.use('*', (req,res)=>res.status(404).json({message: "Invalid path"}))

//Error Handler
app.use(errorHandler);

module.exports = app;