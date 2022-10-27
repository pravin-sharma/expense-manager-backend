const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorHandler = require('./util/Error/errorHandler');


//Import Routes
const testRoute = require('./routes/test');

app.use(cookieParser())

//Routes
app.use('/api/v1',testRoute);
app.use('*', (req,res)=>res.status(404).json({message: "Invalid path"}))

//Error Handler
app.use(errorHandler);

module.exports = app;