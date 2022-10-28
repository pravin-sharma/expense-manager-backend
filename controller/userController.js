const User = require("../model/user");
const CustomError = require("../util/Error/CustomError");

//register
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // check if all fields are present
  if (!name || !email || !password) {
    return next(CustomError.badRequest("Please fill all the fields"));
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    user.password = undefined;

    //create jwt
    const token = user.getJwt();
    console.log(token)

    //send jwt in cookie
    const options = {
        expires: new Date(Date.now() + 24*60*60*1000),
        httpOnly: true
    };

    return res.status(200).cookie("token", token, options).json({
      success: true,
      message: `User '${name}' added.`,
      user
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(CustomError.badRequest("Please fill all the fields"));
  }

  try {
    //check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`user with ${email} does not exist`);
      return next(CustomError.unauthorized("Email or password incorrect"));
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return next(CustomError.unauthorized("Email or password incorrect"));
    }

    //create jwt
    const token = user.getJwt();
    console.log(token)

    //send jwt in cookie
    const options = {
        expires: new Date(Date.now() + 24*60*60*1000),
        httpOnly: true
    };

    //setting password to undefined
    user.password = undefined;

    return res
      .status(200)
      .cookie('token', token, options)
      .json({ 
        message: `Login Successful for Email: ${email}`,
        user
    });
  } catch (error) {
    return next(new Error(error));
  }
};
