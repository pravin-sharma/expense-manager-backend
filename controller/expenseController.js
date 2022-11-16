const Expense = require("../model/expense");
const Category = require("../model/category");
const CustomError = require("../util/Error/CustomError");
const mailer = require("../util/mailer");
const mongoose = require("mongoose");
const moment = require("moment/moment");
const checkExpenseDateIsBetween = require("../util/checkDateIsInBetween");

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

    //Add expense
    const expense = await Expense.create({
      userId,
      categoryId,
      item,
      cost,
      expenseDate,
    });

    let category = await Category.findById(categoryId);
    if (!category) {
      return next(
        CustomError.badRequest(
          `Please add a valid Category, Category ${categoryId} does not exist`
        )
      );
    }

    /*add only if the expense date(expense.expenseDate)
    is between startDate(category.budgetStartDate) and the endDate(category.budgetEndDate)*/
    const isExpenseDateBetweenBudgetDate = checkExpenseDateIsBetween(expense, category);
    if (isExpenseDateBetweenBudgetDate) {
      category.expenseTotal = category.expenseTotal + expense.cost;
      category = await category.save();
    }

    if (isExpenseDateBetweenBudgetDate && (category.expenseTotal > category.budget)) {
      let overBudgetByAmount = category.expenseTotal - category.budget;
      isOverBudget = true;
      mailer(
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

// new get all expenses api with category and period filter;
exports.getAll = async (req, res, next) => {
  const userId = req.user.id;

  const categoryId = req.query.categoryId; // nothing or categoryId //nothing tends to all
  const period = req.query.period; // nothing,7,30 //nothing is all

  let startDate;
  let endDate;
  if (!period || period == "" || period == "undefined") {
    startDate = "1900-01-01";
    endDate = "9999-12-31";
  } else {
    startDate = moment().subtract(parseInt(period), "d").format("yyyy-MM-DD");
    endDate = moment().format("yyyy-MM-DD");
  }

  let query;
  if (!categoryId || categoryId == "" || categoryId == "undefined") {
    query = {
      userId: new mongoose.Types.ObjectId(userId),
      expenseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    query = {
      userId: new mongoose.Types.ObjectId(userId),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      expenseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  }

  //pipline to get categoryName and format date
  const pipeline = [
    {
      $match: query,
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

  // console.log(JSON.stringify(pipeline));

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

    let category = await Category.findById(expense.categoryId);

    /*delete only if the expense date(expense.expenseDate)
    is between startDate(category.budgetStartDate) and the endDate(category.budgetEndDate)*/
    const isExpenseDateBetweenBudgetDate = checkExpenseDateIsBetween(expense, category);
    if (isExpenseDateBetweenBudgetDate) {
      category.expenseTotal = category.expenseTotal - expense.cost;
      category = await category.save();
    }

    return res.status(202).json({
      success: true,
      message: `Expense with id: ${expenseId} deleted.`,
      expense,
    });
  } catch (error) {
    return next(new Error(error));
  }
};
