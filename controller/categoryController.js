const { default: mongoose } = require("mongoose");
const Category = require("../model/category");
const CustomError = require("../util/Error/CustomError");
const moment = require("moment");
const Expense = require("../model/expense");

//add category
// TODO: don't let user add  duplicate category name
exports.addCategory = async (req, res, next) => {
  let { isDefault, categoryName, budget, budgetStartDate, budgetEndDate } =
    req.body;
  let userId = req.user.id;

  try {
    //check if the category with the same name already exists with the user
    const categoryExists = await Category.findOne({
      userId: userId,
      categoryName: new RegExp(categoryName, "i"),
    });

    if (categoryExists) {
      return next(
        CustomError.badRequest(
          `Category "${categoryName}" already exists, Please try another name or use the already existing category.`
        )
      );
    }

    const category = await Category.create({
      isDefault,
      userId,
      categoryName,
      budget,
      budgetStartDate,
      budgetEndDate,
    });

    // Date Formatting
    category._doc.budgetStartDate = moment(category.budgetStartDate).format(
      "yyyy-MM-DD"
    );
    category._doc.budgetEndDate = moment(category.budgetEndDate).format(
      "yyyy-MM-DD"
    );

    return res.status(201).json({
      message: `Category ${categoryName} created`,
      success: true,
      category,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get a category
exports.getOneCategory = async (req, res, next) => {
  const categoryId = req.params?.id;
  const userId = req.user.id;

  try {
    const category = await Category.findOne({ _id: categoryId, userId });

    if (!category) {
      return next(
        CustomError.notFound(`Category with the id: ${categoryId} not found`)
      );
    }

    return res.status(200).json({
      message: `Category with id: ${category._id} found`,
      success: true,
      category,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get all category
exports.getAllCategories = async (req, res, next) => {
  const userId = req.user?.id;

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        isDefault: true,
        categoryName: true,
        budget: true,
        expenseTotal: true,
        budgetStartDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$budgetStartDate",
          },
        },
        budgetEndDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$budgetEndDate",
          },
        },
      },
    },
  ];

  try {
    const categories = await Category.aggregate(pipeline);

    if (!categories) {
      return res.status(404).json({
        success: false,
        message: "No Categories found",
        categories,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories found",
      categories,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//update a category
exports.updateCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  const userId = req.user.id;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId },
      req.body,
      {
        new: true,
      }
    );

    if (!category) {
      return next(
        CustomError.badRequest(`Category with the id: ${categoryId} not found`)
      );
    }

    // Date Formatting
    category._doc.budgetStartDate = moment(category.budgetStartDate).format(
      "yyyy-MM-DD"
    );
    category._doc.budgetEndDate = moment(category.budgetEndDate).format(
      "yyyy-MM-DD"
    );

    return res.status(200).json({
      success: true,
      message: `Category with id: ${categoryId} updated`,
      category,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//delete a category
exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params?.id;
  const userId = req.user.id;

  try {
    //if category have expenses attached to it, then don't delete the category
    const expenseExists = await Expense.findOne({
      userId: userId,
      categoryId: categoryId,
    });

    if (expenseExists) {
      return next(
        CustomError.badRequest(
          `Cannot delete category as it is mapped with expenses`
        )
      );
    }

    const category = await Category.findOneAndDelete({
      _id: categoryId,
      userId,
    });

    if (!category) {
      return next(
        CustomError.badRequest(`Category with the id: ${categoryId} not found`)
      );
    }

    return res.status(202).json({
      success: true,
      message: `Category with id: ${categoryId} deleted.`,
      category,
    });
  } catch (error) {
    return next(new Error(error));
  }
};
