const CustomError = require("./CustomError");

errorHandler = (err, req, res, next) => {
  console.log(err);

  //handle custmom error
  if (err instanceof CustomError) {
    return res
      .status(err.status)
      .json({ message: err.message, success: false });
  } else {
    

    //handle default error
    return res.status(500).json({ message: err.message, success: false });
  }
};

module.exports = errorHandler;
