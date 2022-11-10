const User = require("../model/user");
const CustomError = require("../util/Error/CustomError");
const Category = require("../model/category");
const moment = require("moment");

//register
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // check if all fields are present
  if (!name || !email || !password) {
    return next(CustomError.badRequest("Please fill all the fields"));
  }

  try {
    //check if user already exists
    const userExists = await User.find({ email });
    if (userExists.length > 0) {
      return next(CustomError.badRequest("User already exists"));
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    user.password = undefined;

    //get JWT
    const token = user.getJwt();
    console.log("Server token:", token);

    //Adding default categories for new user
    const defaultCategories = [
      {
        isDefault: true,
        userId: user._id,
        categoryName: "Entertainment",
        budget: 5000,
        budgetStartDate: moment().startOf("month").format("yyyy-MM-DD"),
        budgetEndDate: moment().endOf("month").format("yyyy-MM-DD"),
        expenseTotal: 0,
      },
      {
        isDefault: true,
        userId: user._id,
        categoryName: "Food & Drinks",
        budget: 5000,
        budgetStartDate: moment().startOf("month").format("yyyy-MM-DD"),
        budgetEndDate: moment().endOf("month").format("yyyy-MM-DD"),
        expenseTotal: 0,
      },
      {
        isDefault: true,
        userId: user._id,
        categoryName: "Shopping",
        budget: 10000,
        budgetStartDate: moment().startOf("month").format("yyyy-MM-DD"),
        budgetEndDate: moment().endOf("month").format("yyyy-MM-DD"),
        expenseTotal: 0,
      },
      {
        isDefault: true,
        userId: user._id,
        categoryName: "Housing",
        budget: 20000,
        budgetStartDate: moment().startOf("month").format("yyyy-MM-DD"),
        budgetEndDate: moment().endOf("month").format("yyyy-MM-DD"),
        expenseTotal: 0,
      },
      {
        isDefault: true,
        userId: user._id,
        categoryName: "Health",
        budget: 7000,
        budgetStartDate: moment().startOf("month").format("yyyy-MM-DD"),
        budgetEndDate: moment().endOf("month").format("yyyy-MM-DD"),
        expenseTotal: 0,
      },
    ];

    const categories = await Category.insertMany(defaultCategories);

    return res.status(200).json({
      success: true,
      message: `User '${name}' added.`,
      token,
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
      console.log(`User with ${email} does not exist`);
      return next(CustomError.unauthorized("Email or password incorrect"));
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return next(CustomError.unauthorized("Email or password incorrect"));
    }

    //create jwt
    const token = user.getJwt();

    //setting password to undefined
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: `Login Successful for Email: ${email}`,
      token,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//Get User
exports.getUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(
        CustomError.unauthorized(
          "User does not exist. PLease login with valid credentials"
        )
      );
    }

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User Found",
      user,
    });
  } catch (error) {
    return next(new Error(error));
  }
};
