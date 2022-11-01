const Expense = require("../model/expense");
const Category = require("../model/category");
const CustomError = require("../util/Error/CustomError");
const mailer = require("../util/mailer");

//add
//TODO: if while adding expense, user chooses a category which is not present, then create a new category (Handle in Category Controller)
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

    return res.status(201).json({
      success: true,
      message: `Expense created`,
      expense,
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

  try {
    const expense = await Expense.find({ _id: expenseId, userId });
    if (!expense) {
      return next(
        CustomError.notFound(`Expense with id: ${expenseId} not found`)
      );
    }

    return res.status(200).json({
      message: `Expense with id: ${expense._id} found`,
      success: true,
      expense,
    });
  } catch (error) {
    return next(new Error(error));
  }
};

//get all
exports.getAllExpenses = async (req, res, next) => {
  const userId = req.user?.id;
  try {
    const expenses = await Expense.find({ userId }).populate(
      "categoryId",
      "categoryName"
    );

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
  try {
    //TODO: use a aggregate/group query
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

    return res.status(200).json({
      success: true,
      message: `Expense with id: ${expenseId} updated`,
      expense,
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
