const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  categoryName: {
    type: String,
    required: [true, "Please provide Category"],
  },
  budget: {
    type: Number,
    required: [true, "Please provide the budget for this category"],
    min: [0, "Please fill budget as positive value"],
  },
  budgetStartDate: {
    type: Date,
    required: [true, "Budget start date is required"],
  },
  budgetEndDate: {
    type: Date,
    required: [true, "Budget end date is required"],
  },
  expenseTotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Category", categorySchema);
