const CustomError = require('./CustomError');

errorHandler = (err, req, res, next) =>{
    console.log(err);
    console.log('here')

    //handle custmom error
    if(err instanceof CustomError){
        return res.status(err.status).json({message: err.message});
    }

    //handle default error
    return res.status(500).json({message: 'Something broke'});
}

module.exports = errorHandler;