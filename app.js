const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const errorHandler = require('./util/Error/errorHandler');

//middleware
app.use(express.json());
app.use(cookieParser());
//TODO: use CORS after you get cors error


//Import Routes
const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const expenseRoute = require('./routes/expenseRoute');

//Routes
app.use('/api/v1', userRoute);
app.use('/api/v1', categoryRoute);
app.use('/api/v1', expenseRoute);
app.use('*', (req,res)=>res.status(404).json({message: "Invalid path"}))

//Error Handler
app.use(errorHandler);

module.exports = app;