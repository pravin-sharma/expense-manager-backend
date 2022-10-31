const Category = require("../model/category");
const CustomError = require("../util/Error/CustomError");

//add category
exports.addCategory = async (req, res, next) => {
  let { isDefault, categoryName, budget, budgetStartDate, budgetEndDate } =
    req.body;
  let userId = req.user.id;

  try {
    const category = await Category.create({
      isDefault,
      userId,
      categoryName,
      budget,
      budgetStartDate,
      budgetEndDate,
    });

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

//get all category (default + user specific)
exports.getAllCategories = async (req, res, next) => {
  const userId = req.user?.id;
  try {
    const categories = await Category.find({
      $or: [{ userId }, { isDefault: true }],
    });
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
// TODO: Stop user from updating default category, only admin can do that
exports.updateCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  const userId = req.user.id;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId, isDefault: false },
      req.body,
      {
        new: true,
      }
    );

    if (!category) {
      return next(
        CustomError.badRequest(
          `Category with the id: ${categoryId} not found / is default category and cannot be updated`
        )
      );
    }

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
//TODO: stop user from deleting the default category, only admin can do that
exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params?.id;
  const userId = req.user.id;

  try {
    const category = await Category.findOneAndDelete({
      _id: categoryId,
      userId,
      isDefault: false,
    });

    if (!category) {
      return next(
        CustomError.badRequest(
          `Category with the id: ${categoryId} not found / is default category and cannot be deleted`
        )
      );
    }
    //TODO: check how the response acts with 204
    return res.status(202).json({
      success: true,
      message: `Category with id: ${categoryId} deleted.`,
      category
    });
  } catch (error) {
    return next(new Error(error));
  }
};
