const mongoose = require("mongoose");
const Category = require("./category");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
  item: {
    type: String,
    required: [true, "Please provide item name"],
  },
  cost: {
    type: Number,
    min: [0, "Cost should be a positive number"],
    required: [true, "Please provide cost for the item"],
  },
  expenseDate: {
    type: Date,
    required: [true, "Please provide date for this expense"],
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

expenseSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.find(this.getQuery());

  //Case 1: categoryId update
  //TODO: incase of change in categoryId, remove it's expense from one category and add it to another
  if (
    this._update.categoryId &&
    this._update.categoryId !== docToUpdate[0].categoryId.toString()
  ) {
    try {
      //remove expense from old category
      const oldCategory = await Category.findById(docToUpdate[0].categoryId);
      oldCategory.expenseTotal = oldCategory.expenseTotal - docToUpdate[0].cost;
      await oldCategory.save();

      //add expense to new category
      const newCategory = await Category.findById(this._update.categoryId);
      newCategory.expenseTotal = newCategory.expenseTotal + docToUpdate[0].cost;
      await newCategory.save();
    } catch (error) {
      return next(new Error(error));
    }
  }

  //Case 2: Cost update
  if (this._update.cost && this._update.cost !== docToUpdate[0].cost) {
    //update Category-> expenseTotal
    try {
      const category = await Category.findById(docToUpdate[0].categoryId);
      category.expenseTotal =
        category.expenseTotal - docToUpdate[0].cost + this._update.cost;
      await category.save();
    } catch (error) {
      return next(new Error(error));
    }
  }
  return next();
});

module.exports = mongoose.model("Expense", expenseSchema);
