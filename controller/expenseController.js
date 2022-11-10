const Expense = require("../model/expense");
const Category = require("../model/category");
const CustomError = require("../util/Error/CustomError");
const mailer = require("../util/mailer");
const mongoose = require("mongoose");

//add
exports.addExpense = async (req, res, next) => {
  const { categoryId, item, cost, expenseDate } = req.body;
  const userId = req.user.id;
  let isOverBudget = false;

  try {
    //Check if categoryId belongs to a valid Category, then only add expense
    if (!categoryId) {
      return next(CustomError.badRequest(`Please provide a valid Category`));
    }

    let category = await Category.findById(categoryId);
    if (!category) {
      return next(
        CustomError.badRequest(
          `Please add a valid Category, Category ${categoryId} does not exist`
        )
      );
    }

    //Add expense
    const expense = await Expense.create({
      userId,
      categoryId,
      item,
      cost,
      expenseDate,
    });

    //TODO: after adding every expense update the expenseTotal for that category, if expenseDate(expense) is between budgetStartDate and budgetEndDate
    category.expenseTotal = category.expenseTotal + expense.cost;
    await category.save();

    if (category.expenseTotal > category.budget) {
      let overBudgetByAmount = category.expenseTotal - category.budget;
      isOverBudget = true;
      await mailer(
        req.user.name,
        req.user.email,
        category.categoryName,
        category.budget,
        overBudgetByAmount
      );
    }

    //get added expense along with Category Name and Formatted Date
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(expense._id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
        },
      },
      {
        $project: {
          _id: true,
          userId: true,
          categoryId: true,
          categoryName: "$category.categoryName",
          item: true,
          cost: true,
          expenseDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$expenseDate",
            },
          },
        },
      },
    ];

    const expenseFetch = await Expense.aggregate(pipeline);
    if (!expenseFetch) {
      return next(
        CustomError.notFound(`Expense with id: ${expense._id} not found`)
      );
    }

    return res.status(201).json({
      success: true,
      message: `Expense created`,
      expense: expenseFetch[0],
      isOverBudget,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get one
exports.getOneExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(expenseId),
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
      },
    },
    {
      $project: {
        _id: true,
        userId: true,
        categoryId: true,
        categoryName: "$category.categoryName",
        item: true,
        cost: true,
        expenseDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$expenseDate",
          },
        },
      },
    },
  ];

  try {
    const expense = await Expense.aggregate(pipeline);
    if (!expense) {
      return next(
        CustomError.notFound(`Expense with id: ${expenseId} not found`)
      );
    }

    return res.status(200).json({
      message: `Expense with id: ${expense[0]._id} found`,
      success: true,
      expense: expense[0],
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get all
exports.getAllExpenses = async (req, res, next) => {
  const userId = req.user?.id;

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
      },
    },
    {
      $project: {
        _id: true,
        userId: true,
        categoryId: true,
        categoryName: "$category.categoryName",
        item: true,
        cost: true,
        expenseDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$expenseDate",
          },
        },
      },
    },
  ];

  try {
    const expenses = await Expense.aggregate(pipeline);

    if (!expenses.length) {
      return res.status(200).json({
        message: `No Expenses found`,
        success: true,
        expenses,
      });
    }

    return res.status(200).json({
      message: `Expenses found`,
      success: true,
      expenses,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get all category wise
exports.getAllExpensesByCategory = async (req, res, next) => {
  const userId = req.user.id;
  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$categoryId",
        expenses: {
          $push: {
            _id: "$_id",
            userId: "$userId",
            item: "$item",
            cost: "$cost",
            expenseDate: "$expenseDate",
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
      },
    },
    {
      $project: {
        _id: 1.0,
        categoryName: "$category.categoryName",
        expenses: 1.0,
      },
    },
  ];

  try {
    const expensesByCategories = await Expense.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: `Found expenses by categories`,
      expensesByCategories,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//update
exports.updateExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  const { categoryId, item, cost, expenseDate } = req.body;

  try {
    let expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      req.body,
      { new: true }
    );

    if (!expense) {
      return next(
        CustomError.badRequest(`Expense with the id: ${expenseId} not found`)
      );
    }

    //get updated expense along with Category Name and Formatted Date
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(expense._id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
        },
      },
      {
        $project: {
          _id: true,
          userId: true,
          categoryId: true,
          categoryName: "$category.categoryName",
          item: true,
          cost: true,
          expenseDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$expenseDate",
            },
          },
        },
      },
    ];

    const expenseFetch = await Expense.aggregate(pipeline);

    if (!expenseFetch) {
      return next(
        CustomError.notFound(`Expense with id: ${expense._id} not found`)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Expense with id: ${expenseId} updated`,
      expense: expenseFetch[0],
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//delete
exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params?.id;
  const userId = req.user.id;

  try {
    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId,
    });

    if (!expense) {
      return next(
        CustomError.badRequest(`Expense with the id: ${expenseId} not found`)
      );
    }

    const category = await Category.findById(expense.categoryId);
    category.expenseTotal = category.expenseTotal - expense.cost;
    await category.save();

    return res.status(202).json({
      success: true,
      message: `Expense with id: ${expenseId} deleted.`,
      expense,
    });
  } catch (error) {
    return next(new Error(error));
  }
};
