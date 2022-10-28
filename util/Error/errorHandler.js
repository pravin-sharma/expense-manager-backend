const CustomError = require('./CustomError');

errorHandler = (err, req, res, next) =>{
    console.log(err);

    //handle custmom error
    if(err instanceof CustomError){
        return res.status(err.status).json({message: err.message});
    }

    //handle default error
    return res.status(500).json({message: err.message});
}

module.exports = errorHandler;